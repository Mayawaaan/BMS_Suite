import { PosSession } from '../models/PosSession.js';
import { Product } from '../models/Product.js';
import { Stock } from '../models/Stock.js';
import { Bill } from '../models/Bill.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { postJournalEntry, initializeChartOfAccounts } from '../services/ledgerService.js';
import { getInMemoryProducts } from './productController.js';
import { getInMemoryStock } from './stockController.js';
import { getInMemoryBills } from './billController.js';

let inMemorySessions = [];

/**
 * Open a new POS Register Session
 */
export const openSession = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-retail';
    const { registerId, openingFloat, notes } = req.body;
    const cashierName = req.user?.name || req.body.cashierName || 'Cashier 1';
    const cashierId = req.user?.userId || req.body.cashierId || `cashier-${Date.now()}`;

    const sessionNumber = `POS-SES-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newSession = {
      id: `ses-${Date.now()}`,
      tenantId,
      sessionNumber,
      registerId: registerId || 'Register #1',
      cashierId,
      cashierName,
      status: 'open',
      openingFloat: Number(openingFloat) || 200.0,
      closingCash: 0,
      expectedCash: Number(openingFloat) || 200.0,
      cashDiscrepancy: 0,
      totalSales: 0,
      transactionsCount: 0,
      openedAt: new Date(),
      notes: notes || '',
    };

    let result = newSession;
    if (getDbStatus().connected) {
      try {
        result = await PosSession.create(newSession);
      } catch {
        inMemorySessions.unshift(newSession);
      }
    } else {
      inMemorySessions.unshift(newSession);
    }

    return res.status(201).json({
      success: true,
      message: `POS Register session '${sessionNumber}' opened with float $${newSession.openingFloat}`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Fast SKU / Barcode lookup
 */
export const scanBarcode = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-retail';
    const { code } = req.params;
    const isUniversal = tenantId === 'tenant-universal';

    let product = null;
    if (getDbStatus().connected) {
      const query = { $or: [{ sku: code }, { _id: code }, { name: new RegExp(code, 'i') }] };
      if (!isUniversal) query.tenantId = tenantId;
      product = await Product.findOne(query);
    }

    if (!product) {
      product = getInMemoryProducts().find(
        (p) => (p.sku === code || p.id === code || p.name.toLowerCase().includes(code.toLowerCase())) && (isUniversal || p.tenantId === tenantId)
      );
    }

    if (!product) {
      return res.status(404).json({ success: false, message: `Barcode / SKU '${code}' not found in catalog` });
    }

    return res.json({
      success: true,
      data: {
        id: product.id || product._id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        stockQty: product.stockQty,
        category: product.category,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Instant POS Register Checkout Transaction
 * Decrements inventory, generates receipt, updates register session, and auto-posts double-entry ledger!
 */
export const posCheckout = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-retail';
    const {
      sessionId,
      customerName = 'Walk-in Shopper',
      items = [],
      paymentMethod = 'Cash',
      amountReceived,
      taxRate = 8.5,
      discount = 0,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Checkout cart must contain at least one item' });
    }

    // 1. Calculate totals & decrement inventory
    let computedSubtotal = 0;
    const checkoutItems = [];

    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.unitPrice || item.price) || 0;
      const total = qty * unitPrice;
      computedSubtotal += total;

      checkoutItems.push({
        sku: item.sku || 'SKU-GEN',
        description: item.name || item.description || 'Retail Product',
        quantity: qty,
        unitPrice,
        total,
      });

      // Decrement stock
      if (item.sku) {
        if (getDbStatus().connected) {
          await Product.findOneAndUpdate(
            { tenantId, sku: item.sku },
            { $inc: { stockQty: -qty, salesCount: qty } }
          );
          await Stock.findOneAndUpdate(
            { tenantId, sku: item.sku },
            { $inc: { currentStock: -qty } }
          );
        }

        const memProd = getInMemoryProducts().find((p) => p.sku === item.sku && (tenantId === 'tenant-universal' || p.tenantId === tenantId));
        if (memProd) {
          memProd.stockQty = Math.max(0, memProd.stockQty - qty);
          memProd.salesCount += qty;
        }

        const memStock = getInMemoryStock().find((s) => s.sku === item.sku && (tenantId === 'tenant-universal' || s.tenantId === tenantId));
        if (memStock) {
          memStock.currentStock = Math.max(0, memStock.currentStock - qty);
        }
      }
    }

    const taxAmount = (computedSubtotal * (Number(taxRate) || 0)) / 100;
    const finalAmount = Math.max(0, computedSubtotal + taxAmount - (Number(discount) || 0));
    const tendered = Number(amountReceived) || finalAmount;
    const changeDue = Math.max(0, tendered - finalAmount);

    const invoiceNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Record Receipt as paid Bill
    const receiptBill = {
      id: `bill-pos-${Date.now()}`,
      tenantId,
      invoiceNumber,
      title: `POS Counter Receipt: ${customerName}`,
      vendorOrClient: customerName,
      amount: finalAmount,
      subtotal: computedSubtotal,
      taxRate,
      taxAmount,
      discount,
      items: checkoutItems,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Counter POS',
      status: 'paid',
      paymentMethod,
      notes: `POS Register Checkout. Tendered: $${tendered.toFixed(2)}, Change Due: $${changeDue.toFixed(2)}`,
      businessType: 'shop',
    };

    if (getDbStatus().connected) {
      try {
        await Bill.create(receiptBill);
      } catch {
        getInMemoryBills().unshift(receiptBill);
      }
    } else {
      getInMemoryBills().unshift(receiptBill);
    }

    // 3. Update Register Session if open
    let sessionRecord = inMemorySessions.find((s) => s.id === sessionId || s.sessionNumber === sessionId);
    if (getDbStatus().connected && sessionId) {
      try {
        sessionRecord = await PosSession.findOne({ tenantId, $or: [{ _id: sessionId }, { sessionNumber: sessionId }] });
      } catch {}
    }

    if (sessionRecord) {
      sessionRecord.totalSales = (sessionRecord.totalSales || 0) + finalAmount;
      sessionRecord.transactionsCount = (sessionRecord.transactionsCount || 0) + 1;
      if (paymentMethod.toLowerCase() === 'cash') {
        sessionRecord.expectedCash = (sessionRecord.expectedCash || sessionRecord.openingFloat) + finalAmount;
      }
      if (getDbStatus().connected && sessionRecord.save) {
        await sessionRecord.save();
      }
    }

    // 4. Auto-post immediate Double-Entry Cash Sale to General Ledger
    await initializeChartOfAccounts(tenantId);
    await postJournalEntry({
      tenantId,
      date: new Date().toISOString().split('T')[0],
      memo: `Retail POS Checkout: ${invoiceNumber} (${customerName})`,
      sourceType: 'sale',
      sourceId: invoiceNumber,
      lines: [
        {
          accountCode: '1010',
          accountName: 'Cash and Operating Liquidity',
          debit: finalAmount,
          credit: 0,
          description: `Cash received from POS counter sales on receipt ${invoiceNumber}`,
        },
        {
          accountCode: '4010',
          accountName: 'Commercial Sales & Contract Revenue',
          debit: 0,
          credit: finalAmount,
          description: `Retail store merchandise revenue recognized`,
        },
      ],
      postedBy: 'POS Register Engine',
    }).catch((err) => console.warn('[POS Ledger Warning]:', err.message));

    // Clear caches
    await redisService.delByPattern(`crm:${tenantId}:*`);

    return res.status(201).json({
      success: true,
      message: `Checkout complete. Receipt '${invoiceNumber}' issued.`,
      receipt: {
        receiptNumber: invoiceNumber,
        customerName,
        itemsCount: checkoutItems.length,
        subtotal: computedSubtotal,
        taxAmount,
        total: finalAmount,
        amountReceived: tendered,
        changeDue: Number(changeDue.toFixed(2)),
        paymentMethod,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Close Register Session & Reconcile Cash Drawer
 */
export const closeSession = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-retail';
    const { sessionId } = req.params;
    const { closingCash, notes } = req.body;

    let session = inMemorySessions.find((s) => s.id === sessionId || s.sessionNumber === sessionId);
    if (getDbStatus().connected) {
      try {
        session = await PosSession.findOne({ tenantId, $or: [{ _id: sessionId }, { sessionNumber: sessionId }] });
      } catch {}
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'POS session not found' });
    }

    const actualClosingCash = Number(closingCash) || 0;
    const expected = Number(session.expectedCash) || Number(session.openingFloat) + Number(session.totalSales);
    const discrepancy = actualClosingCash - expected;

    session.status = 'closed';
    session.closingCash = actualClosingCash;
    session.expectedCash = expected;
    session.cashDiscrepancy = Number(discrepancy.toFixed(2));
    session.closedAt = new Date();
    if (notes) session.notes = `${session.notes} | Close Note: ${notes}`;

    if (getDbStatus().connected && session.save) {
      await session.save();
    }

    return res.json({
      success: true,
      message: `POS Session closed. Cash Discrepancy: $${session.cashDiscrepancy}`,
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
