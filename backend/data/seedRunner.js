import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Bill } from '../models/Bill.js';
import { Sale } from '../models/Sale.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Stock } from '../models/Stock.js';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { redisService } from '../config/redis.js';
import { DEFAULT_TENANTS, VERTICAL_TO_TENANT_MAP } from '../middleware/tenantMiddleware.js';
import { initializeChartOfAccounts, postBillCreatedEntry, postSaleWonEntry } from '../services/ledgerService.js';
import {
  seedBills,
  seedSales,
  seedProducts,
  seedCustomers,
  seedStock,
  seedRevenue,
} from './seedData.js';
import {
  EXTENDED_PRODUCTS,
  EXTENDED_BILLS,
  EXTENDED_SALES,
  EXTENDED_CUSTOMERS,
  EXTENDED_STOCK,
} from './extendedBusinessData.js';
import { demoUsers } from '../controllers/authController.js';
import { setInMemoryBills } from '../controllers/billController.js';
import { setInMemorySales } from '../controllers/saleController.js';
import { setInMemoryProducts } from '../controllers/productController.js';
import { setInMemoryCustomers } from '../controllers/customerController.js';
import { setInMemoryStock } from '../controllers/stockController.js';

dotenv.config();

export const runSeed = async (silent = false) => {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  log('\n============================================================');
  log('⚡ OMNIPULSE ENTERPRISE SEED RUNNER (TENANCY & DATA LAYER)');
  log('============================================================\n');

  const results = {
    database: { connected: false, counts: {} },
    redis: { seeded: false, keysSeeded: 0 },
    timestamp: new Date().toISOString(),
  };

  // Clean baseline: Shop and Universal BMS start completely fresh with 0 initial records
  const taggedBills = [];
  const taggedSales = [];
  const taggedProducts = [];
  const taggedCustomers = [];
  const taggedStock = [];

  // Update in-memory fallback stores
  setInMemoryBills(taggedBills);
  setInMemorySales(taggedSales);
  setInMemoryProducts(taggedProducts);
  setInMemoryCustomers(taggedCustomers);
  setInMemoryStock(taggedStock);

  // 1. Seed MongoDB if reachable
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crm_saas';
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    }
    log(`[MongoDB]: Connected to ${mongoose.connection.host}`);
    results.database.connected = true;

    // Clear and re-populate with tenant isolation
    await Promise.all([
      Tenant.deleteMany({}),
      User.deleteMany({}),
      Bill.deleteMany({}),
      Sale.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Stock.deleteMany({}),
      Account.deleteMany({}),
      JournalEntry.deleteMany({}),
    ]);

    const [tRes, uRes, bRes, sRes, pRes, cRes, stRes] = await Promise.all([
      Tenant.insertMany(DEFAULT_TENANTS),
      User.insertMany(demoUsers),
      Bill.insertMany(taggedBills),
      Sale.insertMany(taggedSales),
      Product.insertMany(taggedProducts),
      Customer.insertMany(taggedCustomers),
      Stock.insertMany(taggedStock),
    ]);

    // Initialize Chart of Accounts for each tenant
    for (const tenant of DEFAULT_TENANTS) {
      await initializeChartOfAccounts(tenant.id);
    }

    // Seed initial double-entry journal entries from seed bills and closed-won sales
    for (const bill of taggedBills) {
      await postBillCreatedEntry(bill).catch(() => {});
    }
    for (const sale of taggedSales.filter((s) => s.stage === 'closed_won')) {
      await postSaleWonEntry(sale).catch(() => {});
    }

    results.database.counts = {
      tenants: tRes.length,
      users: uRes.length,
      bills: bRes.length,
      sales: sRes.length,
      products: pRes.length,
      customers: cRes.length,
      stock: stRes.length,
      accounts: DEFAULT_TENANTS.length * 15,
    };

    log(`[MongoDB Seeded]: ${tRes.length} Tenants, ${uRes.length} Users, ${bRes.length} Bills, ${sRes.length} Deals, ${pRes.length} Products, ${cRes.length} Customers, ${stRes.length} Inventory Items, Chart of Accounts & General Ledger Initialized.`);
  } catch (err) {
    log(`[MongoDB Notice]: Database offline (${err.message}). Seeding In-Memory & Redis Cache with tenant scoping.`);
    results.database.connected = false;

    // Initialize in-memory COA
    for (const tenant of DEFAULT_TENANTS) {
      await initializeChartOfAccounts(tenant.id);
    }
    for (const bill of taggedBills) {
      await postBillCreatedEntry(bill).catch(() => {});
    }
    for (const sale of taggedSales.filter((s) => s.stage === 'closed_won')) {
      await postSaleWonEntry(sale).catch(() => {});
    }

    results.database.counts = {
      tenants: DEFAULT_TENANTS.length,
      users: demoUsers.length,
      bills: taggedBills.length,
      sales: taggedSales.length,
      products: taggedProducts.length,
      customers: taggedCustomers.length,
      stock: taggedStock.length,
      accounts: DEFAULT_TENANTS.length * 15,
    };
  }

  // 2. Seed Redis Key-Value Store Across All Tenants
  try {
    log('\n[Redis Engine]: Pre-warming and seeding key-value cache across multi-tenant domains...');
    let keysCount = 0;

    // Clear old CRM keys
    await redisService.delByPattern('crm:*');

    // Cache Tenants & Users
    await redisService.set('crm:system:tenants', DEFAULT_TENANTS, 'EX', 7200);
    await redisService.set('crm:users:all', demoUsers, 'EX', 7200);
    keysCount += 2;

    for (const tenant of DEFAULT_TENANTS) {
      const tenantId = tenant.id;
      const isUniversal = tenantId === 'tenant-universal';

      const tBills = isUniversal ? taggedBills : taggedBills.filter((b) => b.tenantId === tenantId);
      const tSales = isUniversal ? taggedSales : taggedSales.filter((s) => s.tenantId === tenantId);
      const tProducts = isUniversal ? taggedProducts : taggedProducts.filter((p) => p.tenantId === tenantId);
      const tCustomers = isUniversal ? taggedCustomers : taggedCustomers.filter((c) => c.tenantId === tenantId);
      const tStock = isUniversal ? taggedStock : taggedStock.filter((st) => st.tenantId === tenantId);

      await redisService.set(`crm:${tenantId}:bills:all`, tBills, 'EX', 3600);
      await redisService.set(`crm:${tenantId}:sales:all`, tSales, 'EX', 3600);
      await redisService.set(`crm:${tenantId}:products:all`, tProducts, 'EX', 3600);
      await redisService.set(`crm:${tenantId}:customers:all`, tCustomers, 'EX', 3600);
      await redisService.set(`crm:${tenantId}:stock:all`, tStock, 'EX', 3600);
      keysCount += 5;
    }

    results.redis.seeded = true;
    results.redis.keysSeeded = keysCount;
    log(`[Redis Seeded]: Pre-warmed ${keysCount} tenant-isolated cache keys.`);
  } catch (err) {
    log(`[Redis Warning]: Could not seed cache keys (${err.message})`);
  }

  log('\n============================================================');
  log('🎉 MASTER SEEDING COMPLETE: Multi-tenant data layer active');
  log('============================================================\n');

  return results;
};

// Allow direct CLI execution: node backend/data/seedRunner.js
if (process.argv[1]?.endsWith('seedRunner.js')) {
  runSeed().then(() => {
    process.exit(0);
  });
}
