import {
  getAccounts,
  getJournalEntries,
  postJournalEntry,
  generateBalanceSheet,
  generateIncomeStatement,
  generateTrialBalance,
} from '../services/ledgerService.js';
import {
  calculateAgingReceivables,
  calculateCogsAnalytics,
  calculateRevenueVelocity,
  calculateExecutiveFinancialHealth,
} from '../services/analyticsEngine.js';
import { redisService } from '../config/redis.js';

/**
 * Get Chart of Accounts with real-time debit/credit balances
 */
export const getChartOfAccounts = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const cacheKey = `crm:${tenantId}:ledger:accounts`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, count: cached.length, data: cached });
    }

    const accounts = await getAccounts(tenantId);
    await redisService.set(cacheKey, accounts, 'EX', 1800);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Journal Entries for the active tenant
 */
export const getJournal = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const limit = Number(req.query.limit) || 50;
    const entries = await getJournalEntries(tenantId, limit);
    return res.json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Manually post a double-entry Journal Entry (validated for Debits == Credits)
 */
export const createJournalEntry = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-software';
    const { date, memo, lines, sourceType, sourceId } = req.body;

    const posted = await postJournalEntry({
      tenantId,
      date,
      memo,
      sourceType: sourceType || 'manual',
      sourceId,
      lines,
      postedBy: req.user?.name || 'Authorized Accountant',
    });

    return res.status(201).json({
      success: true,
      message: `Journal entry '${posted.entryNumber}' posted successfully with balanced double-entry validation`,
      data: posted,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get Real-Time Balance Sheet (Assets = Liabilities + Equity)
 */
export const getBalanceSheet = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const cacheKey = `crm:${tenantId}:ledger:balance-sheet`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }

    const statement = await generateBalanceSheet(tenantId);
    await redisService.set(cacheKey, statement, 'EX', 1800);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, data: statement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Real-Time Income Statement (Revenue - COGS - Expenses = Net Operating Income)
 */
export const getIncomeStatement = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const cacheKey = `crm:${tenantId}:ledger:income-statement`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }

    const statement = await generateIncomeStatement(tenantId);
    await redisService.set(cacheKey, statement, 'EX', 1800);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, data: statement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Trial Balance (Debits == Credits verification)
 */
export const getTrialBalance = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const trialBalance = await generateTrialBalance(tenantId);
    return res.json({ success: true, data: trialBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Dynamic Accounts Receivable Aging Schedule (Current, 1-30, 31-60, 61-90, 90+ days)
 */
export const getAgingSchedule = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const cacheKey = `crm:${tenantId}:analytics:aging`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }

    const aging = await calculateAgingReceivables(tenantId);
    await redisService.set(cacheKey, aging, 'EX', 900);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, data: aging });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Dynamic Cost of Goods Sold (COGS) & Gross Margin metrics
 */
export const getCogsMetrics = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const cogs = await calculateCogsAnalytics(tenantId);
    return res.json({ success: true, data: cogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get SaaS ARR/MRR Waterfall & Revenue Velocity
 */
export const getRevenueVelocityMetrics = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const velocity = await calculateRevenueVelocity(tenantId);
    return res.json({ success: true, data: velocity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Comprehensive Executive Financial Health & Corporate Valuation
 * EBITDA, Net Profit, Net Worth, ROI, ROA, ROE, Multiples & Cash Runway
 */
export const getExecutiveFinancialSummary = async (req, res) => {
  try {
    const tenantId = req.tenantId || 'tenant-universal';
    const cacheKey = `crm:${tenantId}:analytics:executive-summary`;

    const isZeroState = tenantId === 'tenant-empty';
    const forceRefresh = req.query.refresh === 'true' || req.query.fresh === 'true';

    if (!forceRefresh) {
      const cached = await redisService.get(cacheKey);
      if (cached && (isZeroState || (cached.headlineKpis?.ebitda?.value > 0 || cached.profitability?.grossRevenue > 0))) {
        res.setHeader('X-Cache', 'HIT');
        return res.json({ success: true, data: cached });
      }
    }

    const data = await calculateExecutiveFinancialHealth(tenantId);
    await redisService.set(cacheKey, data, 'EX', 300);
    res.setHeader('X-Cache', 'MISS');
    return res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
