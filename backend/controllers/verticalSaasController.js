import { Subscription } from '../models/Subscription.js';
import { Bill } from '../models/Bill.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { postJournalEntry, initializeChartOfAccounts } from '../services/ledgerService.js';
import { getInMemoryBills } from './billController.js';

let inMemorySubscriptions = [
  {
    id: 'sub-001',
    tenantId: 'tenant-software',
    subscriptionNumber: 'SUB-2026-001',
    customerId: 'cust-saas-01',
    customerName: 'FinTech Cloud Corp',
    customerEmail: 'billing@fintechcloud.io',
    planName: 'Enterprise Scale Tier (100 Seats)',
    mrr: 4500.0,
    billingInterval: 'monthly',
    status: 'active',
    seats: 100,
    currentPeriodStart: '2026-10-01',
    currentPeriodEnd: '2026-11-01',
    nextBillingDate: '2026-11-01',
    autoRenew: true,
  },
  {
    id: 'sub-002',
    tenantId: 'tenant-software',
    subscriptionNumber: 'SUB-2026-002',
    customerId: 'cust-saas-02',
    customerName: 'QuantMetrics AI Labs',
    customerEmail: 'accounts@quantmetrics.ai',
    planName: 'Pro Tier (25 Seats)',
    mrr: 1200.0,
    billingInterval: 'monthly',
    status: 'active',
    seats: 25,
    currentPeriodStart: '2026-10-15',
    currentPeriodEnd: '2026-11-15',
    nextBillingDate: '2026-11-15',
    autoRenew: true,
  },
];

/**
 * Get Subscriptions and MRR/ARR summary
 */
export const getSubscriptions = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const isUniversal = tenantId === 'tenant-universal';

    let subs = [];
    if (getDbStatus().connected) {
      const query = isUniversal ? {} : { tenantId };
      subs = await Subscription.find(query).sort({ mrr: -1 });
    }
    if (subs.length === 0) {
      subs = inMemorySubscriptions.filter((s) => isUniversal || s.tenantId === tenantId);
    }

    const activeSubs = subs.filter((s) => s.status === 'active');
    const totalMrr = activeSubs.reduce((sum, s) => sum + (Number(s.mrr) || 0), 0);
    const totalArr = totalMrr * 12;

    return res.json({
      success: true,
      count: subs.length,
      metrics: {
        activeSubscriptions: activeSubs.length,
        totalMrr: Number(totalMrr.toFixed(2)),
        totalArr: Number(totalArr.toFixed(2)),
        averageRevenuePerAccount: activeSubs.length > 0 ? Number((totalMrr / activeSubs.length).toFixed(2)) : 0,
      },
      data: subs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new SaaS Subscription
 */
export const createSubscription = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const {
      customerId,
      customerName,
      customerEmail,
      planName,
      mrr,
      billingInterval = 'monthly',
      seats = 10,
    } = req.body;

    if (!customerName || !customerEmail || mrr === undefined) {
      return res.status(400).json({ success: false, message: 'Customer details and MRR amount are required' });
    }

    const subscriptionNumber = `SUB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newSub = {
      id: `sub-${Date.now()}`,
      tenantId,
      subscriptionNumber,
      customerId: customerId || `cust-${Date.now()}`,
      customerName,
      customerEmail,
      planName: planName || 'Enterprise Subscription',
      mrr: Number(mrr) || 0,
      billingInterval,
      status: 'active',
      seats: Number(seats) || 5,
      currentPeriodStart: today,
      currentPeriodEnd: nextMonth,
      nextBillingDate: nextMonth,
      autoRenew: true,
    };

    let result = newSub;
    if (getDbStatus().connected) {
      try {
        result = await Subscription.create(newSub);
      } catch {
        inMemorySubscriptions.unshift(newSub);
      }
    } else {
      inMemorySubscriptions.unshift(newSub);
    }

    // Invalidate caches
    await redisService.delByPattern(`crm:${tenantId}:*`);

    return res.status(201).json({
      success: true,
      message: `Subscription '${subscriptionNumber}' activated for ${customerName} ($${mrr}/mo MRR)`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Automated Recurring Billing Run
 * Invoices all subscriptions and auto-posts revenue recognition
 */
export const triggerBillingRun = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const isUniversal = tenantId === 'tenant-universal';

    let subs = inMemorySubscriptions.filter((s) => s.status === 'active' && (isUniversal || s.tenantId === tenantId));
    if (getDbStatus().connected) {
      try {
        const query = { status: 'active' };
        if (!isUniversal) query.tenantId = tenantId;
        const dbSubs = await Subscription.find(query);
        if (dbSubs.length > 0) subs = dbSubs;
      } catch {}
    }

    const invoicesGenerated = [];
    let totalInvoiced = 0;

    await initializeChartOfAccounts(tenantId);

    for (const sub of subs) {
      const amount = Number(sub.mrr) || 0;
      if (amount <= 0) continue;

      const invoiceNumber = `INV-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBill = {
        id: `bill-rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tenantId: sub.tenantId || tenantId,
        invoiceNumber,
        title: `Recurring License Renewal: ${sub.planName}`,
        vendorOrClient: sub.customerName,
        clientEmail: sub.customerEmail,
        amount,
        subtotal: amount,
        taxRate: 0,
        taxAmount: 0,
        discount: 0,
        items: [
          {
            description: `${sub.planName} (${sub.seats} Seats) - Monthly Cycle`,
            quantity: 1,
            unitPrice: amount,
            total: amount,
          },
        ],
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'SaaS License Renewal',
        status: 'pending',
        paymentMethod: 'Credit Card / Autopay',
        businessType: 'software',
      };

      if (getDbStatus().connected) {
        try {
          await Bill.create(newBill);
        } catch {
          getInMemoryBills().unshift(newBill);
        }
      } else {
        getInMemoryBills().unshift(newBill);
      }

      // Auto-post SaaS Recurring Revenue journal entry (Debit: A/R 1020, Credit: SaaS ARR 4020)
      await postJournalEntry({
        tenantId: sub.tenantId || tenantId,
        date: newBill.issueDate,
        memo: `Recurring Subscription Invoiced: ${invoiceNumber} (${sub.customerName})`,
        sourceType: 'sale',
        sourceId: invoiceNumber,
        lines: [
          {
            accountCode: '1020',
            accountName: 'Accounts Receivable (A/R)',
            debit: amount,
            credit: 0,
            description: `Accrue subscription receivable for ${sub.customerName}`,
          },
          {
            accountCode: '4020',
            accountName: 'SaaS Recurring Subscription Revenue',
            debit: 0,
            credit: amount,
            description: `Recognize earned SaaS ARR for ${sub.planName}`,
          },
        ],
        postedBy: 'Automated Subscription Billing Runner',
      }).catch((err) => console.warn('[SaaS Billing Run Ledger Warning]:', err.message));

      // Advance period
      const nextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      sub.currentPeriodStart = new Date().toISOString().split('T')[0];
      sub.currentPeriodEnd = nextDate;
      sub.nextBillingDate = nextDate;

      if (getDbStatus().connected && sub.save) {
        await sub.save();
      }

      invoicesGenerated.push({
        invoiceNumber,
        customerName: sub.customerName,
        planName: sub.planName,
        amount,
      });
      totalInvoiced += amount;
    }

    await redisService.delByPattern(`crm:${tenantId}:*`);

    return res.json({
      success: true,
      message: `Billing run complete. Generated ${invoicesGenerated.length} recurring invoices totaling $${totalInvoiced.toLocaleString()}`,
      summary: {
        totalInvoiced: Number(totalInvoiced.toFixed(2)),
        invoicesCount: invoicesGenerated.length,
        invoices: invoicesGenerated,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cancel a Subscription & Log Churn
 */
export const cancelSubscription = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const { id } = req.params;
    const { reason = 'Customer Churned' } = req.body;

    let sub = inMemorySubscriptions.find((s) => s.id === id || s.subscriptionNumber === id);
    if (getDbStatus().connected) {
      try {
        sub = await Subscription.findOne({ tenantId, $or: [{ _id: id }, { subscriptionNumber: id }] });
      } catch {}
    }

    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    sub.status = 'cancelled';
    sub.autoRenew = false;
    if (getDbStatus().connected && sub.save) {
      await sub.save();
    }

    return res.json({
      success: true,
      message: `Subscription '${sub.subscriptionNumber}' cancelled. MRR reduction: -$${sub.mrr}. Reason: ${reason}`,
      data: sub,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
