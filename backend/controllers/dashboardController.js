import { Bill } from '../models/Bill.js';
import { Sale } from '../models/Sale.js';
import { Stock } from '../models/Stock.js';
import { Customer } from '../models/Customer.js';
import { seedRevenue } from '../data/seedData.js';
import { redisService } from '../config/redis.js';
import { getDbStatus } from '../config/db.js';
import { getInMemoryBills } from './billController.js';
import { getInMemorySales } from './saleController.js';
import { getInMemoryStock } from './stockController.js';
import { getInMemoryCustomers } from './customerController.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const { businessType } = req.query;
    const tenantId = req.tenantId || 'tenant-universal';
    const isUniversal = tenantId === 'tenant-universal';
    const cacheKey = `crm:${tenantId}:dashboard:${businessType || 'all'}`;

    const cached = await redisService.get(cacheKey);
    if (cached && cached.velocitySeries) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, tenantId, data: cached, source: 'redis-cache' });
    }

    let bills = [];
    let sales = [];
    let stock = [];
    let customers = [];

    const dbConnected = getDbStatus().connected;

    if (dbConnected) {
      const query = {};
      if (!isUniversal) query.tenantId = tenantId;
      if (businessType && businessType !== 'all') query.businessType = businessType;

      [bills, sales, stock, customers] = await Promise.all([
        Bill.find(query),
        Sale.find(query),
        Stock.find(query),
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
      stock = getInMemoryStock().filter(filter);
      customers = getInMemoryCustomers().filter(filter);
    }

    // Dynamic metrics calculation from active tenant records
    const totalPipeline = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const wonDeals = sales.filter((s) => s.stage === 'closed_won');
    const totalWon = wonDeals.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const unpaidBills = bills.filter((b) => b.status === 'pending' || b.status === 'overdue');
    const totalUnpaidBills = unpaidBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    const lowStockCount = stock.filter((s) => s.status === 'low_stock' || s.status === 'out_of_stock').length;
    const activeCustomersCount = customers.filter((c) => c.status === 'active').length;

    const vertMetric = seedRevenue.verticalMetrics[businessType || req.tenant?.vertical || 'all'] || seedRevenue.verticalMetrics.all;

    // Derived dynamic MRR / ARR from closed sales and bills (strictly 0 if no records)
    const dynamicMrr = totalWon > 0 ? Math.round(totalWon / 12) : 0;
    const dynamicArr = totalWon > 0 ? totalWon : 0;
    const dynamicGrowth = (sales.length > 0 || bills.length > 0) ? (vertMetric?.growthMoM || 0) : 0;

    // Dynamic 6-month trajectory for Executive Pulse Velocity Graph
    const monthLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const velocityData = monthLabels.map((m, idx) => {
      if (totalWon === 0) return 0;
      // Trailing distribution curve ending with totalWon
      const weights = [0.52, 0.64, 0.75, 0.84, 0.93, 1.0];
      return Math.round(totalWon * weights[idx]);
    });

    const netOperatingMargin = totalWon > 0
      ? (businessType === 'factory' ? 42.8 : businessType === 'industry' ? 36.5 : 82.4)
      : 0;

    const summary = {
      tenantId,
      tenantName: req.tenant?.name || 'ZSYIO Enterprise',
      tenantPlan: req.tenant?.planTier || 'starter',
      businessType: businessType || 'all',
      velocitySeries: {
        labels: monthLabels,
        data: velocityData,
        netOperatingMargin,
        currentVelocity: totalWon > 0 ? velocityData[velocityData.length - 1] : 0,
        growthMoM: dynamicGrowth,
        unit: 'INR',
      },
      kpis: {
        mrr: dynamicMrr,
        arr: dynamicArr,
        growthMoM: dynamicGrowth,
        pipelineValue: totalPipeline,
        closedWonValue: totalWon,
        activeCustomers: activeCustomersCount,
        totalCustomers: customers.length,
        unpaidBillsAmount: totalUnpaidBills,
        unpaidBillsCount: unpaidBills.length,
        lowStockAlerts: lowStockCount,
      },
      quickAlerts: [
        {
          id: 1,
          type: lowStockCount > 0 ? 'warning' : 'success',
          text: lowStockCount > 0 
            ? `${lowStockCount} items currently below safety threshold in ${req.tenant?.name || 'inventory'}`
            : `Inventory healthy - zero low stock alerts across ${req.tenant?.name || 'warehouse'}`,
          link: '/stock',
        },
        {
          id: 2,
          type: unpaidBills.length > 0 ? 'danger' : 'success',
          text: unpaidBills.length > 0
            ? `${unpaidBills.length} invoices pending/overdue totaling $${totalUnpaidBills.toLocaleString()}`
            : 'All receivables cleared. No outstanding pending bills.',
          link: '/bills',
        },
        {
          id: 3,
          type: 'success',
          text: totalWon > 0 
            ? `Revenue velocity: $${totalWon.toLocaleString()} in won operations (+${dynamicGrowth}% MoM)`
            : 'Operational pipeline active. Ready to close new contracts and bills.',
          link: '/sales',
        },
      ],
      recentActivity: sales.slice(0, 4).map((s, idx) => ({
        id: `act-${idx + 1}`,
        module: 'sales',
        title: `${s.dealName || 'Deal'} (${s.customerName || 'Customer'})`,
        amount: s.amount || 0,
        time: s.stage === 'closed_won' ? 'Completed' : 'Active Pipeline',
      })),
    };

    await redisService.set(cacheKey, summary, 'EX', 1800);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, tenantId, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
