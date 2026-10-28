import { Sale } from '../models/Sale.js';
import { seedSales } from '../data/seedData.js';
import { EXTENDED_SALES } from '../data/extendedBusinessData.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { VERTICAL_TO_TENANT_MAP } from '../middleware/tenantMiddleware.js';
import { postSaleWonEntry } from '../services/ledgerService.js';

let inMemorySales = [];

export const getSales = async (req, res) => {
  try {
    const { businessType } = req.query;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';
    const cacheKey = `crm:${tenantId}:sales:${businessType || 'all'}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, count: cached.length, data: cached, source: 'redis-cache' });
    }

    const filter = (s) => {
      if (!isUniversal && s.tenantId && s.tenantId !== tenantId) return false;
      if (!businessType || businessType === 'all') return true;
      return (s.businessType || 'software') === businessType;
    };

    let result = [];
    if (getDbStatus().connected) {
      const query = {};
      if (!isUniversal) query.tenantId = tenantId;
      if (businessType && businessType !== 'all') query.businessType = businessType;
      result = await Sale.find(query).sort({ createdAt: -1 });
    } else {
      result = inMemorySales.filter(filter);
    }

    await redisService.set(cacheKey, result, 'EX', 3600);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, count: result.length, tenantId, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const { dealName, customerName, customerEmail, amount, stage, probability, expectedCloseDate, rep, businessType } = req.body;
    const newSale = {
      id: `deal-${Date.now()}`,
      tenantId,
      dealName,
      customerName,
      customerEmail,
      amount: Number(amount) || 0,
      stage: stage || 'prospect',
      probability: Number(probability) || 25,
      expectedCloseDate: expectedCloseDate || new Date().toISOString().split('T')[0],
      rep: rep || 'Elena Rostova',
      businessType: businessType || (req.tenant?.vertical !== 'all' ? req.tenant?.vertical : 'software'),
    };

    let result = null;
    if (getDbStatus().connected) {
      result = await Sale.create(newSale);
    } else {
      inMemorySales.unshift(newSale);
      result = newSale;
    }

    await redisService.delByPattern(`crm:${tenantId}:sales:*`);
    await redisService.delByPattern(`crm:${tenantId}:dashboard:*`);
    await redisService.delByPattern('crm:tenant-universal:sales:*');
    await redisService.delByPattern('crm:tenant-universal:dashboard:*');

    // Auto-post revenue recognition if closed won
    if (stage === 'closed_won') {
      postSaleWonEntry(result).catch((err) => console.warn('[Ledger Auto-Post Notice]:', err.message));
    }

    return res.status(201).json({ success: true, message: 'Deal logged successfully with tenant scope', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSaleStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, probability } = req.body;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    let updated = null;
    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      updated = await Sale.findOneAndUpdate(query, { stage, ...(probability !== undefined && { probability }) }, { new: true });
    }

    const index = inMemorySales.findIndex((s) => (s.id === id || s._id === id) && (isUniversal || s.tenantId === tenantId));
    if (index !== -1) {
      inMemorySales[index].stage = stage;
      if (probability !== undefined) inMemorySales[index].probability = probability;
      updated = inMemorySales[index];
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    // Auto-post revenue recognition when transitioning to closed won
    if (stage === 'closed_won') {
      postSaleWonEntry(updated).catch((err) => console.warn('[Ledger Auto-Post Notice]:', err.message));
    }

    await redisService.delByPattern(`crm:${tenantId}:sales:*`);
    await redisService.delByPattern(`crm:${tenantId}:dashboard:*`);
    await redisService.delByPattern('crm:tenant-universal:sales:*');
    await redisService.delByPattern('crm:tenant-universal:dashboard:*');

    return res.json({ success: true, message: 'Pipeline stage updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      await Sale.findOneAndDelete(query);
    }
    inMemorySales = inMemorySales.filter((s) => !((s.id === id || s._id === id) && (isUniversal || s.tenantId === tenantId)));

    await redisService.delByPattern(`crm:${tenantId}:sales:*`);
    await redisService.delByPattern(`crm:${tenantId}:dashboard:*`);
    await redisService.delByPattern('crm:tenant-universal:sales:*');
    await redisService.delByPattern('crm:tenant-universal:dashboard:*');

    return res.json({ success: true, message: 'Sale deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInMemorySales = () => inMemorySales;
export const setInMemorySales = (sales) => {
  inMemorySales = sales;
};
export const addInMemorySales = (items) => {
  const arr = Array.isArray(items) ? items : [items];
  inMemorySales.unshift(...arr);
};
