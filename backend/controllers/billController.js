import { Bill } from '../models/Bill.js';
import { seedBills } from '../data/seedData.js';
import { EXTENDED_BILLS } from '../data/extendedBusinessData.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { VERTICAL_TO_TENANT_MAP } from '../middleware/tenantMiddleware.js';
import { postBillCreatedEntry, postBillPaidEntry } from '../services/ledgerService.js';

// Initialize in-memory bills with clean empty array
let inMemoryBills = [];

export const getBills = async (req, res) => {
  try {
    const { businessType } = req.query;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';
    const cacheKey = `crm:${tenantId}:bills:${businessType || 'all'}`;

    // 1. Try Redis cache lookup
    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, count: cached.length, data: cached, source: 'redis-cache' });
    }

    const filter = (b) => {
      // Tenant Isolation
      if (!isUniversal && b.tenantId && b.tenantId !== tenantId) {
        return false;
      }
      if (!businessType || businessType === 'all') return true;
      return (b.businessType || 'software') === businessType;
    };

    let result = [];
    if (getDbStatus().connected) {
      const query = {};
      if (!isUniversal) query.tenantId = tenantId;
      if (businessType && businessType !== 'all') query.businessType = businessType;

      result = await Bill.find(query).sort({ createdAt: -1 });
    } else {
      result = inMemoryBills.filter(filter);
    }

    // 2. Cache in Redis
    await redisService.set(cacheKey, result, 'EX', 3600);
    res.setHeader('X-Cache', 'MISS');
    return res.json({
      success: true,
      count: result.length,
      tenantId,
      data: result,
      source: getDbStatus().connected ? 'mongodb' : 'fixtures',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBill = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const {
      title,
      invoiceNumber,
      vendorOrClient,
      amount,
      dueDate,
      issueDate,
      category,
      status,
      paymentMethod,
      notes,
      businessType,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      clientEmail,
      clientAddress,
    } = req.body;

    const parsedItems = Array.isArray(items) ? items : [];
    const computedSubtotal =
      parsedItems.length > 0
        ? parsedItems.reduce(
            (sum, item) => sum + (Number(item.total) || Number(item.quantity || 1) * Number(item.unitPrice || 0)),
            0
          )
        : Number(subtotal) || Number(amount) || 0;

    const parsedTaxRate = Number(taxRate) || 0;
    const computedTaxAmount =
      Number(taxAmount) !== undefined && Number(taxAmount) > 0
        ? Number(taxAmount)
        : computedSubtotal * (parsedTaxRate / 100);

    const computedDiscount = Number(discount) || 0;
    const finalAmount = Number(amount) || Math.max(0, computedSubtotal + computedTaxAmount - computedDiscount);

    const newBillData = {
      id: `bill-${Date.now()}`,
      tenantId,
      invoiceNumber: invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: title || `Invoice to ${vendorOrClient || 'Client'}`,
      vendorOrClient: vendorOrClient || 'Valued Client',
      amount: finalAmount,
      subtotal: computedSubtotal,
      taxRate: parsedTaxRate,
      taxAmount: computedTaxAmount,
      discount: computedDiscount,
      items:
        parsedItems.length > 0
          ? parsedItems
          : [
              {
                description: title || 'Professional Services / Goods',
                quantity: 1,
                unitPrice: finalAmount,
                total: finalAmount,
              },
            ],
      clientEmail: clientEmail || '',
      clientAddress: clientAddress || '',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: category || 'General',
      status: status || 'pending',
      paymentMethod: paymentMethod || 'Wire Transfer',
      notes: notes || '',
      businessType: businessType || (req.tenant?.vertical !== 'all' ? req.tenant?.vertical : 'software'),
    };

    let result = null;
    if (getDbStatus().connected) {
      result = await Bill.create(newBillData);
    } else {
      inMemoryBills.unshift(newBillData);
      result = newBillData;
    }

    // Auto-Invalidate tenant-scoped Redis cache
    await redisService.delByPattern(`crm:${tenantId}:bills:*`);
    await redisService.delByPattern(`crm:${tenantId}:dashboard:*`);
    await redisService.delByPattern('crm:tenant-universal:bills:*');
    await redisService.delByPattern('crm:tenant-universal:dashboard:*');

    // Trigger Double-Entry General Ledger Posting (Accounts Payable + Expense recognition)
    postBillCreatedEntry(result).catch((err) => console.warn('[Ledger Auto-Post Notice]:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Bill created successfully with tenant scoping and ledger entry',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    let updated = null;
    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      updated = await Bill.findOneAndUpdate(query, { status }, { new: true });
    }

    const index = inMemoryBills.findIndex((b) => (b.id === id || b._id === id) && (isUniversal || b.tenantId === tenantId));
    if (index !== -1) {
      inMemoryBills[index].status = status;
      updated = inMemoryBills[index];
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Bill not found within active tenant scope' });
    }

    // If bill status transitioned to paid, trigger cash settlement double-entry
    if (status === 'paid') {
      postBillPaidEntry(updated).catch((err) => console.warn('[Ledger Auto-Post Notice]:', err.message));
    }

    // Invalidate Redis cache
    await redisService.delByPattern(`crm:${tenantId}:bills:*`);
    await redisService.delByPattern(`crm:${tenantId}:dashboard:*`);
    await redisService.delByPattern('crm:tenant-universal:bills:*');
    await redisService.delByPattern('crm:tenant-universal:dashboard:*');

    return res.json({ success: true, message: 'Bill status updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    let deleted = false;
    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      const res = await Bill.findOneAndDelete(query);
      if (res) deleted = true;
    }

    const initialLen = inMemoryBills.length;
    inMemoryBills = inMemoryBills.filter((b) => !((b.id === id || b._id === id) && (isUniversal || b.tenantId === tenantId)));
    if (inMemoryBills.length < initialLen) deleted = true;

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Bill not found or permission denied' });
    }

    await redisService.delByPattern(`crm:${tenantId}:bills:*`);
    await redisService.delByPattern(`crm:${tenantId}:dashboard:*`);
    await redisService.delByPattern('crm:tenant-universal:bills:*');
    await redisService.delByPattern('crm:tenant-universal:dashboard:*');

    return res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInMemoryBills = () => inMemoryBills;
export const setInMemoryBills = (bills) => {
  inMemoryBills = bills;
};
export const addInMemoryBills = (items) => {
  const arr = Array.isArray(items) ? items : [items];
  inMemoryBills.unshift(...arr);
};
