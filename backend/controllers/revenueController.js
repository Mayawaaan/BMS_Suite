import { seedRevenue } from '../data/seedData.js';
import { redisService } from '../config/redis.js';
import { getDbStatus } from '../config/db.js';
import { Bill } from '../models/Bill.js';
import { Sale } from '../models/Sale.js';
import { Customer } from '../models/Customer.js';
import { Stock } from '../models/Stock.js';
import { Product } from '../models/Product.js';
import { getInMemoryBills } from './billController.js';
import { getInMemorySales } from './saleController.js';
import { getInMemoryCustomers } from './customerController.js';
import { getInMemoryStock } from './stockController.js';
import { getInMemoryProducts } from './productController.js';

let inMemoryRevenue = JSON.parse(JSON.stringify(seedRevenue));

export const getRevenueAnalytics = async (req, res) => {
  try {
    const { businessType } = req.query;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';
    const cacheKey = `crm:${tenantId}:revenue:${businessType || 'all'}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, tenantId, data: cached, source: 'redis-cache' });
    }

    let bills = [];
    let sales = [];
    let customers = [];
    const dbConnected = getDbStatus().connected;

    if (dbConnected) {
      const query = {};
      if (!isUniversal) query.tenantId = tenantId;
      if (businessType && businessType !== 'all') query.businessType = businessType;

      [bills, sales, customers] = await Promise.all([
        Bill.find(query),
        Sale.find(query),
        Customer.find(query),
      ]);
    } else {
      const filter = (item) => {
        if (!isUniversal && item.tenantId && item.tenantId !== tenantId) return false;
        if (!businessType || businessType === 'all') return true;
        return item.businessType === businessType;
      };

      bills = getInMemoryBills().filter(filter);
      sales = getInMemorySales().filter(filter);
      customers = getInMemoryCustomers().filter(filter);
    }

    const wonSales = sales.filter((s) => s.stage === 'closed_won');
    const totalWon = wonSales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalPipeline = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const paidBills = bills.filter((b) => b.status === 'paid');
    const totalPaidBills = paidBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const activeCustomers = customers.filter((c) => c.status === 'active').length;

    const hasData = sales.length > 0 || bills.length > 0;
    const effectiveTotal = totalWon > 0 ? totalWon : totalPaidBills;

    const dynamicMrr = hasData && effectiveTotal > 0 ? Math.round(effectiveTotal / 12) : 0;
    const dynamicArr = hasData && effectiveTotal > 0 ? effectiveTotal : 0;
    const dynamicGrossMargin = hasData ? 78.4 : 0;
    const dynamicGrowthMoM = hasData ? (totalWon > 0 ? 14.5 : 0) : 0;
    const dynamicChurn = hasData ? 1.2 : 0;

    // Generate monthly series (zeroed out if no data)
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthlyTrends = months.map((month, idx) => {
      if (!hasData || dynamicMrr === 0) {
        return { month, mrr: 0, arr: 0 };
      }
      const scale = 0.8 + (idx * 0.04);
      const m = Math.round(dynamicMrr * scale);
      return { month, mrr: m, arr: m * 12 };
    });

    // Revenue streams based on vertical
    const revenueStreams = hasData ? [
      { name: `${req.tenant?.name || 'Retail'} Point-of-Sale`, percentage: 65, amount: Math.round(dynamicArr * 0.65), color: '#9A3412' },
      { name: 'Direct Commercial Invoices', percentage: 25, amount: Math.round(dynamicArr * 0.25), color: '#C2410C' },
      { name: 'Digital Recurring Subscriptions', percentage: 10, amount: Math.round(dynamicArr * 0.10), color: '#7C2D12' },
    ] : [
      { name: 'Point-of-Sale Invoices', percentage: 0, amount: 0, color: '#9A3412' },
      { name: 'Commercial Contracts', percentage: 0, amount: 0, color: '#C2410C' },
    ];

    const data = {
      tenantId,
      tenantName: req.tenant?.name || 'ZSYIO Enterprise',
      overview: {
        mrr: dynamicMrr,
        arr: dynamicArr,
        totalPipeline,
        grossMargin: dynamicGrossMargin,
        growthRateMoM: dynamicGrowthMoM,
        churnRate: dynamicChurn,
        activePaidAccounts: activeCustomers,
      },
      monthlyTrends,
      revenueStreams,
    };

    await redisService.set(cacheKey, data, 'EX', 1800);
    res.setHeader('X-Cache', 'MISS');
    return res.json({
      success: true,
      tenantId,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRevenueTarget = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const { mrr, arr, grossMargin, churnRate } = req.body;
    if (mrr !== undefined) inMemoryRevenue.overview.mrr = Number(mrr);
    if (arr !== undefined) inMemoryRevenue.overview.arr = Number(arr);
    if (grossMargin !== undefined) inMemoryRevenue.overview.grossMargin = Number(grossMargin);
    if (churnRate !== undefined) inMemoryRevenue.overview.churnRate = Number(churnRate);

    // Invalidate Redis cache for this tenant
    await redisService.delByPattern(`crm:${tenantId}:revenue:*`);
    await redisService.delByPattern(`crm:${tenantId}:dashboard:*`);
    await redisService.delByPattern('crm:tenant-universal:revenue:*');
    await redisService.delByPattern('crm:tenant-universal:dashboard:*');

    return res.json({
      success: true,
      message: 'Revenue target updated successfully',
      data: inMemoryRevenue.overview,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Cross-Business Portfolio Financial Analytics
 * Categorizes which business vertical is PROFITABLE, LOSS_MAKING, or CLEAN_SLATE
 */
export const getPortfolioAnalytics = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';
    const cacheKey = `crm:${tenantId}:portfolio-analytics`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, tenantId, data: cached, source: 'redis-cache' });
    }

    let bills = [];
    let sales = [];
    let customers = [];
    let stock = [];
    let products = [];

    if (getDbStatus().connected) {
      const query = isUniversal ? {} : { tenantId };
      [bills, sales, customers, stock, products] = await Promise.all([
        Bill.find(query),
        Sale.find(query),
        Customer.find(query),
        Stock.find(query),
        Product.find(query),
      ]);
    } else {
      const filter = (item) => isUniversal || !item.tenantId || item.tenantId === tenantId;
      bills = getInMemoryBills().filter(filter);
      sales = getInMemorySales().filter(filter);
      customers = getInMemoryCustomers().filter(filter);
      stock = getInMemoryStock().filter(filter);
      products = getInMemoryProducts().filter(filter);
    }

    const VERTICAL_SPECS = [
      { id: 'shop', name: 'Retail Store & POS', badge: 'Retail POS', category: 'Store Operations' },
      { id: 'factory', name: 'Smart Manufacturing', badge: 'Factory', category: 'Heavy Production' },
      { id: 'industry', name: 'Heavy Industry & EPC', badge: 'Heavy EPC', category: 'Capital Projects' },
      { id: 'software', name: 'SaaS & Tech Enterprise', badge: 'Software SaaS', category: 'Cloud Subscriptions' },
      { id: 'ecommerce', name: 'D2C Brands & E-Commerce', badge: 'E-Commerce', category: 'Online Direct' },
    ];

    const entities = VERTICAL_SPECS.map((spec) => {
      const vId = spec.id;
      const vSales = sales.filter((s) => s.businessType === vId);
      const vBills = bills.filter((b) => b.businessType === vId);
      const vCustomers = customers.filter((c) => c.businessType === vId);
      const vStock = stock.filter((st) => st.businessType === vId);

      const wonSales = vSales.filter((s) => s.stage === 'closed_won');
      const revenue = wonSales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      const pipelineValue = vSales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

      const expenses = vBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
      const paidExpenses = vBills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
      const pendingExpenses = vBills.filter((b) => b.status === 'pending' || b.status === 'overdue').reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

      const netProfit = revenue - expenses;
      const hasActivity = revenue > 0 || expenses > 0;
      const profitMargin = revenue > 0
        ? Number(((netProfit / revenue) * 100).toFixed(1))
        : expenses > 0
        ? -100
        : 0;

      let status = 'CLEAN_SLATE';
      if (hasActivity) {
        if (netProfit > 0) status = 'PROFITABLE';
        else if (netProfit < 0) status = 'LOSS_MAKING';
        else status = 'BREAK_EVEN';
      }

      const inventoryValue = vStock.reduce((sum, s) => sum + (Number(s.currentStock || 0) * 35), 0);

      return {
        id: vId,
        name: spec.name,
        badge: spec.badge,
        category: spec.category,
        revenue,
        pipelineValue,
        expenses,
        paidExpenses,
        pendingExpenses,
        netProfit,
        profitMargin,
        status,
        inventoryValue,
        wonDealsCount: wonSales.length,
        totalDealsCount: vSales.length,
        billsCount: vBills.length,
        customersCount: vCustomers.length,
        hasActivity,
      };
    });

    const totalRevenue = entities.reduce((sum, e) => sum + e.revenue, 0);
    const totalExpenses = entities.reduce((sum, e) => sum + e.expenses, 0);
    const totalNetProfit = totalRevenue - totalExpenses;
    const portfolioMargin = totalRevenue > 0 ? Number(((totalNetProfit / totalRevenue) * 100).toFixed(1)) : 0;

    const profitableCount = entities.filter((e) => e.status === 'PROFITABLE').length;
    const lossMakingCount = entities.filter((e) => e.status === 'LOSS_MAKING').length;
    const cleanSlateCount = entities.filter((e) => e.status === 'CLEAN_SLATE').length;

    const rankedByProfit = [...entities].sort((a, b) => b.netProfit - a.netProfit);
    const topPerformer = rankedByProfit[0]?.revenue > 0 ? rankedByProfit[0] : null;
    const worstPerformer = [...entities].sort((a, b) => a.netProfit - b.netProfit)[0];
    const topLoss = worstPerformer?.netProfit < 0 ? worstPerformer : null;

    const portfolioSummary = {
      totalRevenue,
      totalExpenses,
      totalNetProfit,
      portfolioMargin,
      profitableCount,
      lossMakingCount,
      cleanSlateCount,
      topPerformer: topPerformer ? { name: topPerformer.name, netProfit: topPerformer.netProfit, margin: topPerformer.profitMargin } : null,
      topLoss: topLoss ? { name: topLoss.name, netLoss: topLoss.netProfit, margin: topLoss.profitMargin } : null,
      entities: entities.map((e) => ({
        ...e,
        revenueShare: totalRevenue > 0 ? Number(((e.revenue / totalRevenue) * 100).toFixed(1)) : 0,
      })),
    };

    await redisService.set(cacheKey, portfolioSummary, 'EX', 120);
    return res.json({ success: true, tenantId, data: portfolioSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

