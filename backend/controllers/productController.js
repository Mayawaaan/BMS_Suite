import { Product } from '../models/Product.js';
import { seedProducts } from '../data/seedData.js';
import { EXTENDED_PRODUCTS } from '../data/extendedBusinessData.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { VERTICAL_TO_TENANT_MAP } from '../middleware/tenantMiddleware.js';

let inMemoryProducts = [];

export const getProducts = async (req, res) => {
  try {
    const { businessType } = req.query;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';
    const cacheKey = `crm:${tenantId}:products:${businessType || 'all'}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, count: cached.length, data: cached, source: 'redis-cache' });
    }

    const filter = (p) => {
      if (!isUniversal && p.tenantId && p.tenantId !== tenantId) return false;
      if (!businessType || businessType === 'all') return true;
      return (p.businessType || 'software') === businessType;
    };

    let result = [];
    if (getDbStatus().connected) {
      const query = {};
      if (!isUniversal) query.tenantId = tenantId;
      if (businessType && businessType !== 'all') query.businessType = businessType;
      result = await Product.find(query).sort({ createdAt: -1 });
    } else {
      result = inMemoryProducts.filter(filter);
    }

    await redisService.set(cacheKey, result, 'EX', 3600);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, count: result.length, tenantId, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const { name, sku, category, price, costPrice, stockQty, minStockLevel, status, businessType } = req.body;
    const newProduct = {
      id: `prod-${Date.now()}`,
      tenantId,
      name,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: category || 'General',
      price: Number(price) || 0,
      costPrice: Number(costPrice) || 0,
      stockQty: Number(stockQty) || 0,
      minStockLevel: Number(minStockLevel) || 10,
      status: status || 'active',
      rating: 5.0,
      salesCount: 0,
      businessType: businessType || (req.tenant?.vertical !== 'all' ? req.tenant?.vertical : 'software'),
    };

    let result = null;
    if (getDbStatus().connected) {
      result = await Product.create(newProduct);
    } else {
      inMemoryProducts.unshift(newProduct);
      result = newProduct;
    }

    await redisService.delByPattern(`crm:${tenantId}:products:*`);
    await redisService.delByPattern('crm:tenant-universal:products:*');

    return res.status(201).json({ success: true, message: 'Product created with tenant scope', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    let updated = null;
    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      updated = await Product.findOneAndUpdate(query, req.body, { new: true });
    }

    const index = inMemoryProducts.findIndex((p) => (p.id === id || p._id === id) && (isUniversal || p.tenantId === tenantId));
    if (index !== -1) {
      inMemoryProducts[index] = { ...inMemoryProducts[index], ...req.body };
      updated = inMemoryProducts[index];
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await redisService.delByPattern(`crm:${tenantId}:products:*`);
    await redisService.delByPattern('crm:tenant-universal:products:*');

    return res.json({ success: true, message: 'Product updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      await Product.findOneAndDelete(query);
    }
    inMemoryProducts = inMemoryProducts.filter((p) => !((p.id === id || p._id === id) && (isUniversal || p.tenantId === tenantId)));

    await redisService.delByPattern(`crm:${tenantId}:products:*`);
    await redisService.delByPattern('crm:tenant-universal:products:*');

    return res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInMemoryProducts = () => inMemoryProducts;
export const setInMemoryProducts = (products) => {
  inMemoryProducts = products;
};
export const addInMemoryProducts = (items) => {
  const arr = Array.isArray(items) ? items : [items];
  inMemoryProducts.unshift(...arr);
};
