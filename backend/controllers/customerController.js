import { Customer } from '../models/Customer.js';
import { seedCustomers } from '../data/seedData.js';
import { EXTENDED_CUSTOMERS } from '../data/extendedBusinessData.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { VERTICAL_TO_TENANT_MAP } from '../middleware/tenantMiddleware.js';

let inMemoryCustomers = [];

export const getCustomers = async (req, res) => {
  try {
    const { businessType } = req.query;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';
    const cacheKey = `crm:${tenantId}:customers:${businessType || 'all'}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, count: cached.length, data: cached, source: 'redis-cache' });
    }

    const filter = (c) => {
      if (!isUniversal && c.tenantId && c.tenantId !== tenantId) return false;
      if (!businessType || businessType === 'all') return true;
      return (c.businessType || 'software') === businessType;
    };

    let result = [];
    if (getDbStatus().connected) {
      const query = {};
      if (!isUniversal) query.tenantId = tenantId;
      if (businessType && businessType !== 'all') query.businessType = businessType;
      result = await Customer.find(query).sort({ createdAt: -1 });
    } else {
      result = inMemoryCustomers.filter(filter);
    }

    await redisService.set(cacheKey, result, 'EX', 3600);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, count: result.length, tenantId, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const { name, email, company, phone, status, businessType } = req.body;
    const newCustomer = {
      id: `cust-${Date.now()}`,
      tenantId,
      name,
      email,
      company: company || 'Independent',
      phone: phone || '',
      status: status || 'lead',
      totalSpend: 0,
      dealsCount: 0,
      lastContacted: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      businessType: businessType || (req.tenant?.vertical !== 'all' ? req.tenant?.vertical : 'software'),
    };

    let result = null;
    if (getDbStatus().connected) {
      result = await Customer.create(newCustomer);
    } else {
      inMemoryCustomers.unshift(newCustomer);
      result = newCustomer;
    }

    await redisService.delByPattern(`crm:${tenantId}:customers:*`);
    await redisService.delByPattern('crm:tenant-universal:customers:*');

    return res.status(201).json({ success: true, message: 'Customer created with tenant scope', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    let updated = null;
    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      updated = await Customer.findOneAndUpdate(query, req.body, { new: true });
    }

    const index = inMemoryCustomers.findIndex((c) => (c.id === id || c._id === id) && (isUniversal || c.tenantId === tenantId));
    if (index !== -1) {
      inMemoryCustomers[index] = { ...inMemoryCustomers[index], ...req.body };
      updated = inMemoryCustomers[index];
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await redisService.delByPattern(`crm:${tenantId}:customers:*`);
    await redisService.delByPattern('crm:tenant-universal:customers:*');

    return res.json({ success: true, message: 'Customer updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';

    if (getDbStatus().connected) {
      const query = { _id: id };
      if (!isUniversal) query.tenantId = tenantId;
      await Customer.findOneAndDelete(query);
    }
    inMemoryCustomers = inMemoryCustomers.filter((c) => !((c.id === id || c._id === id) && (isUniversal || c.tenantId === tenantId)));

    await redisService.delByPattern(`crm:${tenantId}:customers:*`);
    await redisService.delByPattern('crm:tenant-universal:customers:*');

    return res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInMemoryCustomers = () => inMemoryCustomers;
export const setInMemoryCustomers = (customers) => {
  inMemoryCustomers = customers;
};
export const addInMemoryCustomers = (items) => {
  const arr = Array.isArray(items) ? items : [items];
  inMemoryCustomers.unshift(...arr);
};
