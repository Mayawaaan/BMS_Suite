import { Bom } from '../models/Bom.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { Product } from '../models/Product.js';
import { Stock } from '../models/Stock.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { postJournalEntry, initializeChartOfAccounts } from '../services/ledgerService.js';
import { getInMemoryProducts } from './productController.js';
import { getInMemoryStock } from './stockController.js';

let inMemoryBoms = [
  {
    id: 'bom-001',
    tenantId: 'tenant-factory',
    bomNumber: 'BOM-2026-001',
    name: 'Precision Hydraulic Stamping Valve Assembly',
    finishedProductId: 'prod-mfg-01',
    finishedProductName: 'Hydraulic Stamping Control Valve',
    finishedSku: 'SKU-VALVE-400',
    components: [
      { rawProductName: 'Cast Aluminum Ingot Grade A', rawSku: 'RAW-ALUM-01', quantityRequired: 2.5, unitCost: 45.0 },
      { rawProductName: 'High-Pressure Nitrile O-Ring Seal', rawSku: 'RAW-SEAL-09', quantityRequired: 4.0, unitCost: 3.5 },
      { rawProductName: 'Hardened Steel Actuator Pin', rawSku: 'RAW-PIN-22', quantityRequired: 1.0, unitCost: 18.0 },
    ],
    laborCost: 35.0,
    overheadCost: 15.0,
    totalUnitCost: 194.5,
    isActive: true,
  },
];

let inMemoryWorkOrders = [];

/**
 * List Bill of Materials (BOM)
 */
export const getBoms = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-factory';
    const isUniversal = tenantId === 'tenant-universal';

    let boms = [];
    if (getDbStatus().connected) {
      const query = isUniversal ? {} : { tenantId };
      boms = await Bom.find(query);
    }
    if (boms.length === 0) {
      boms = inMemoryBoms.filter((b) => isUniversal || b.tenantId === tenantId);
    }

    return res.json({ success: true, count: boms.length, data: boms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new Bill of Materials
 */
export const createBom = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-factory';
    const {
      name,
      finishedProductName,
      finishedSku,
      finishedProductId,
      components = [],
      laborCost = 0,
      overheadCost = 0,
    } = req.body;

    if (!finishedProductName || !finishedSku) {
      return res.status(400).json({ success: false, message: 'Finished product name and SKU are required' });
    }

    // Calculate total unit cost
    const rawCost = components.reduce(
      (sum, c) => sum + (Number(c.quantityRequired) || 1) * (Number(c.unitCost) || 0),
      0
    );
    const totalUnitCost = rawCost + Number(laborCost) + Number(overheadCost);

    const bomNumber = `BOM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newBom = {
      id: `bom-${Date.now()}`,
      tenantId,
      bomNumber,
      name: name || `BOM for ${finishedProductName}`,
      finishedProductId: finishedProductId || `prod-${Date.now()}`,
      finishedProductName,
      finishedSku,
      components,
      laborCost: Number(laborCost),
      overheadCost: Number(overheadCost),
      totalUnitCost: Number(totalUnitCost.toFixed(2)),
      isActive: true,
    };

    let result = newBom;
    if (getDbStatus().connected) {
      try {
        result = await Bom.create(newBom);
      } catch {
        inMemoryBoms.unshift(newBom);
      }
    } else {
      inMemoryBoms.unshift(newBom);
    }

    return res.status(201).json({
      success: true,
      message: `Bill of Materials '${bomNumber}' created successfully with unit cost $${totalUnitCost.toFixed(2)}`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * List Manufacturing Work Orders
 */
export const getWorkOrders = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-factory';
    const isUniversal = tenantId === 'tenant-universal';

    let orders = [];
    if (getDbStatus().connected) {
      const query = isUniversal ? {} : { tenantId };
      orders = await WorkOrder.find(query).sort({ createdAt: -1 });
    }
    if (orders.length === 0) {
      orders = inMemoryWorkOrders.filter((w) => isUniversal || w.tenantId === tenantId);
    }

    return res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Schedule a new Production Work Order
 */
export const createWorkOrder = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-factory';
    const { bomId, quantityToProduce = 10, warehouse = 'Plant Depot Alpha', notes } = req.body;

    // Find BOM
    let bom = inMemoryBoms.find((b) => b.id === bomId || b.bomNumber === bomId);
    if (getDbStatus().connected && !bom) {
      bom = await Bom.findOne({ tenantId, $or: [{ _id: bomId }, { bomNumber: bomId }] });
    }

    if (!bom) {
      bom = inMemoryBoms[0]; // fallback
    }

    const orderNumber = `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: `wo-${Date.now()}`,
      tenantId,
      orderNumber,
      bomId: bom.id || bom._id || bomId,
      targetProductId: bom.finishedProductId,
      targetProductName: bom.finishedProductName,
      targetSku: bom.finishedSku,
      quantityToProduce: Number(quantityToProduce) || 10,
      quantityProduced: 0,
      status: 'scheduled',
      warehouse,
      startDate: new Date().toISOString().split('T')[0],
      completionDate: null,
      notes: notes || `Production run for ${quantityToProduce} units of ${bom.finishedProductName}`,
    };

    let result = newOrder;
    if (getDbStatus().connected) {
      try {
        result = await WorkOrder.create(newOrder);
      } catch {
        inMemoryWorkOrders.unshift(newOrder);
      }
    } else {
      inMemoryWorkOrders.unshift(newOrder);
    }

    return res.status(201).json({
      success: true,
      message: `Work Order '${orderNumber}' scheduled for ${quantityToProduce} units`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Complete a Work Order: Decrement raw materials, increment finished goods, and post manufacturing journal entry
 */
export const completeWorkOrder = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-factory';
    const { id } = req.params;

    let order = inMemoryWorkOrders.find((w) => w.id === id || w.orderNumber === id);
    if (getDbStatus().connected) {
      try {
        order = await WorkOrder.findOne({ tenantId, $or: [{ _id: id }, { orderNumber: id }] });
      } catch {}
    }

    if (!order) {
      return res.status(404).json({ success: false, message: `Work Order '${id}' not found` });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Work Order is already completed' });
    }

    // Find BOM
    let bom = inMemoryBoms.find((b) => b.id === order.bomId || b._id === order.bomId || b.bomNumber === order.bomId);
    if (!bom) bom = inMemoryBoms[0];

    const qty = Number(order.quantityToProduce) || 1;

    // 1. Decrement raw materials in stock
    for (const comp of bom.components || []) {
      const neededRaw = comp.quantityRequired * qty;
      const memStock = getInMemoryStock().find((s) => s.sku === comp.rawSku && (tenantId === 'tenant-universal' || s.tenantId === tenantId));
      if (memStock) {
        memStock.currentStock = Math.max(0, memStock.currentStock - neededRaw);
      }
      if (getDbStatus().connected) {
        await Stock.findOneAndUpdate(
          { tenantId, sku: comp.rawSku },
          { $inc: { currentStock: -neededRaw } }
        );
      }
    }

    // 2. Increment finished goods stock
    const memFinishedStock = getInMemoryStock().find((s) => s.sku === order.targetSku && (tenantId === 'tenant-universal' || s.tenantId === tenantId));
    if (memFinishedStock) {
      memFinishedStock.currentStock += qty;
    } else {
      getInMemoryStock().push({
        id: `stk-${Date.now()}`,
        tenantId,
        productId: order.targetProductId,
        productName: order.targetProductName,
        sku: order.targetSku,
        warehouse: order.warehouse || 'Plant Depot Alpha',
        currentStock: qty,
        reservedStock: 0,
        minThreshold: 10,
        status: 'in_stock',
        lastRestocked: new Date().toISOString().split('T')[0],
        businessType: 'factory',
      });
    }

    if (getDbStatus().connected) {
      await Stock.findOneAndUpdate(
        { tenantId, sku: order.targetSku },
        { $inc: { currentStock: qty } },
        { upsert: true }
      );
      await Product.findOneAndUpdate(
        { tenantId, sku: order.targetSku },
        { $inc: { stockQty: qty } },
        { upsert: true }
      );
    }

    // 3. Update order state
    order.status = 'completed';
    order.quantityProduced = qty;
    order.completionDate = new Date().toISOString().split('T')[0];

    if (getDbStatus().connected && order.save) {
      await order.save();
    }

    // 4. Auto-post Manufacturing COGS & Inventory Transfer Journal Entry
    const totalManufacturingCost = Number((bom.totalUnitCost * qty).toFixed(2));
    await initializeChartOfAccounts(tenantId);
    await postJournalEntry({
      tenantId,
      date: new Date().toISOString().split('T')[0],
      memo: `Production Run Completed: ${order.orderNumber} (${qty} units of ${order.targetProductName})`,
      sourceType: 'inventory_adjustment',
      sourceId: order.orderNumber,
      lines: [
        {
          accountCode: '1030',
          accountName: 'Merchandise & Inventory Asset',
          debit: totalManufacturingCost,
          credit: 0,
          description: `Capitalize ${qty} units of ${order.targetProductName} finished goods`,
        },
        {
          accountCode: '5010',
          accountName: 'Cost of Goods Sold (COGS)',
          debit: 0,
          credit: totalManufacturingCost,
          description: `Transfer raw material consumption & manufacturing overhead into finished inventory`,
        },
      ],
      postedBy: 'Manufacturing Execution System (MES)',
    }).catch((err) => console.warn('[Mfg Ledger Notice]:', err.message));

    // Clear caches
    await redisService.delByPattern(`crm:${tenantId}:*`);

    return res.json({
      success: true,
      message: `Work Order '${order.orderNumber}' completed. ${qty} units of ${order.targetProductName} dispatched to ${order.warehouse}.`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
