import { Stock } from '../models/Stock.js';
import { seedStock } from '../data/seedData.js';
import { EXTENDED_STOCK } from '../data/extendedBusinessData.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { VERTICAL_TO_TENANT_MAP } from '../middleware/tenantMiddleware.js';

let inMemoryStock = [];

export const getStock = async (req, res) => {
  try {
    const { businessType } = req.query;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';
    const cacheKey = `crm:${tenantId}:stock:${businessType || 'all'}`;

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
      result = await Stock.find(query).sort({ createdAt: -1 });
    } else {
      result = inMemoryStock.filter(filter);
    }

    await redisService.set(cacheKey, result, 'EX', 3600);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, count: result.length, tenantId, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStockItem = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const { productName, sku, warehouse, currentStock, reservedStock, minThreshold, businessType } = req.body;
    const current = Number(currentStock) || 0;
    const min = Number(minThreshold) || 10;
    let status = 'in_stock';
    if (current === 0) status = 'out_of_stock';
    else if (current <= min) status = 'low_stock';

    const newItem = {
      id: `stk-${Date.now()}`,
      tenantId,
      productId: `prod-${Date.now()}`,
      productName,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      warehouse: warehouse || 'North America Hub',
      currentStock: current,
      reservedStock: Number(reservedStock) || 0,
      minThreshold: min,
      status,
      lastRestocked: new Date().toISOString().split('T')[0],
      businessType: businessType || (req.tenant?.vertical !== 'all' ? req.tenant?.vertical : 'software'),
    };

    let result = null;
    if (getDbStatus().connected) {
      result = await Stock.create(newItem);
    } else {
      inMemoryStock.unshift(newItem);
      result = newItem;
    }

    await redisService.delByPattern(`crm:${tenantId}:stock:*`);
    await redisService.delByPattern('crm:tenant-universal:stock:*');

    return res.status(201).json({ success: true, message: 'Stock recorded with tenant scope', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateStockQty = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStock, reservedStock } = req.body;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    let item = inMemoryStock.find((s) => (s.id === id || s._id === id) && (isUniversal || s.tenantId === tenantId));

    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      const dbItem = await Stock.findOne(query);
      if (dbItem) item = dbItem;
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }

    const current = currentStock !== undefined ? Number(currentStock) : item.currentStock;
    const reserved = reservedStock !== undefined ? Number(reservedStock) : item.reservedStock;
    let status = 'in_stock';
    if (current === 0) status = 'out_of_stock';
    else if (current <= item.minThreshold) status = 'low_stock';

    let updated = null;
    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      updated = await Stock.findOneAndUpdate(
        query,
        { currentStock: current, reservedStock: reserved, status, lastRestocked: new Date().toISOString().split('T')[0] },
        { new: true }
      );
    }

    const index = inMemoryStock.findIndex((s) => (s.id === id || s._id === id) && (isUniversal || s.tenantId === tenantId));
    if (index !== -1) {
      inMemoryStock[index].currentStock = current;
      inMemoryStock[index].reservedStock = reserved;
      inMemoryStock[index].status = status;
      inMemoryStock[index].lastRestocked = new Date().toISOString().split('T')[0];
      updated = inMemoryStock[index];
    }

    await redisService.delByPattern(`crm:${tenantId}:stock:*`);
    await redisService.delByPattern('crm:tenant-universal:stock:*');

    return res.json({ success: true, message: 'Stock level synchronized', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStockLevel = updateStockQty;

export const deleteStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      await Stock.findOneAndDelete(query);
    }
    inMemoryStock = inMemoryStock.filter((s) => !((s.id === id || s._id === id) && (isUniversal || s.tenantId === tenantId)));

    await redisService.delByPattern(`crm:${tenantId}:stock:*`);
    await redisService.delByPattern('crm:tenant-universal:stock:*');

    return res.json({ success: true, message: 'Stock item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInMemoryStock = () => inMemoryStock;
export const setInMemoryStock = (stock) => {
  inMemoryStock = stock;
};
export const addInMemoryStock = (items) => {
  const arr = Array.isArray(items) ? items : [items];
  inMemoryStock.unshift(...arr);
};
