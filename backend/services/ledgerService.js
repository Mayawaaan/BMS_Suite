import { Account } from '../models/Account.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';

// Standard Enterprise Chart of Accounts Template
export const STANDARD_CHART_OF_ACCOUNTS = [
  // --- 1000: ASSETS (Normal Balance: Debit) ---
  { code: '1010', name: 'Cash and Operating Liquidity', type: 'asset', normalBalance: 'debit', description: 'Primary corporate checking and treasury cash reserves.' },
  { code: '1020', name: 'Accounts Receivable (A/R)', type: 'asset', normalBalance: 'debit', description: 'Invoiced customer balances awaiting collection.' },
  { code: '1030', name: 'Merchandise & Inventory Asset', type: 'asset', normalBalance: 'debit', description: 'Valuation of finished goods, shelf SKUs, and raw stock.' },

  // --- 2000: LIABILITIES (Normal Balance: Credit) ---
  { code: '2010', name: 'Accounts Payable (A/P)', type: 'liability', normalBalance: 'credit', description: 'Unpaid vendor invoices, supplier bills, and trade debts.' },
  { code: '2020', name: 'Sales Tax & VAT Payable', type: 'liability', normalBalance: 'credit', description: 'Accrued statutory taxes collected on sales transactions.' },
  { code: '2030', name: 'Accrued Operating Liabilities', type: 'liability', normalBalance: 'credit', description: 'Payroll obligations and short-term payables.' },

  // --- 3000: EQUITY (Normal Balance: Credit) ---
  { code: '3010', name: 'Retained Earnings', type: 'equity', normalBalance: 'credit', description: 'Cumulative historic operating profits reinvested in the firm.' },
  { code: '3020', name: "Owner's Contributed Capital", type: 'equity', normalBalance: 'credit', description: 'Paid-in shareholder equity and venture capital reserves.' },

  // --- 4000: REVENUE (Normal Balance: Credit) ---
  { code: '4010', name: 'Commercial Sales & Contract Revenue', type: 'revenue', normalBalance: 'credit', description: 'Gross revenue earned from products, retail POS, and contracts.' },
  { code: '4020', name: 'SaaS Recurring Subscription Revenue', type: 'revenue', normalBalance: 'credit', description: 'ARR / MRR recognized from recurring platform licenses.' },

  // --- 5000: COGS (Normal Balance: Debit) ---
  { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'cogs', normalBalance: 'debit', description: 'Direct acquisition cost and manufacturing bill of materials.' },
  { code: '5020', name: 'Direct Cloud Delivery Infrastructure', type: 'cogs', normalBalance: 'debit', description: 'Direct AWS/GCP compute costs dedicated to service hosting.' },

  // --- 6000: OPERATING EXPENSES (Normal Balance: Debit) ---
  { code: '6010', name: 'Cloud, Hosting & Software Overhead', type: 'expense', normalBalance: 'debit', description: 'Internal tools, API token consumption, and IT hosting.' },
  { code: '6020', name: 'Facilities, Leases & Utilities', type: 'expense', normalBalance: 'debit', description: 'Commercial plant leases, retail store rent, and utility bills.' },
  { code: '6030', name: 'Sales, Marketing & Customer Acquisition', type: 'expense', normalBalance: 'debit', description: 'Digital ad spend, sales commissions, and promotional collateral.' },
  { code: '6040', name: 'General & Administrative (G&A)', type: 'expense', normalBalance: 'debit', description: 'Legal retainers, compliance audits, and office administrative costs.' },
];

// In-Memory Ledger Storage Fallback
let inMemoryAccounts = [];
let inMemoryJournalEntries = [];

/**
 * Initialize Chart of Accounts for a given tenant
 */
export const initializeChartOfAccounts = async (tenantId) => {
  if (!tenantId) return [];

  const existingMemory = inMemoryAccounts.filter((a) => a.tenantId === tenantId);
  if (existingMemory.length > 0) return existingMemory;

  const defaultAccounts = STANDARD_CHART_OF_ACCOUNTS.map((template) => ({
    ...template,
    id: `acc-${tenantId}-${template.code}`,
    tenantId,
    balance: 0,
    isActive: true,
  }));

  if (getDbStatus().connected) {
    try {
      const existing = await Account.find({ tenantId });
      if (existing.length === 0) {
        await Account.insertMany(defaultAccounts);
      }
    } catch {
      // Continue to in-memory store
    }
  }

  inMemoryAccounts.push(...defaultAccounts);
  return defaultAccounts;
};

/**
 * Get Chart of Accounts for a tenant
 */
export const getAccounts = async (tenantId) => {
  await initializeChartOfAccounts(tenantId);

  if (getDbStatus().connected) {
    try {
      const isUniversal = tenantId === 'tenant-universal';
      const query = isUniversal ? {} : { tenantId };
      const accounts = await Account.find(query).sort({ code: 1 });
      if (accounts.length > 0) return accounts;
    } catch {
      // Continue to in-memory
    }
  }

  const isUniversal = tenantId === 'tenant-universal';
  return isUniversal
    ? inMemoryAccounts
    : inMemoryAccounts.filter((a) => a.tenantId === tenantId);
};

/**
 * Post a double-entry Journal Entry with strict balanced debit/credit validation
 */
export const postJournalEntry = async ({
  tenantId,
  date,
  memo,
  sourceType = 'manual',
  sourceId = '',
  lines = [],
  postedBy = 'System Ledger Engine',
}) => {
  if (!tenantId) throw new Error('Tenant ID required to post journal entry.');
  if (!Array.isArray(lines) || lines.length < 2) {
    throw new Error('A journal entry must contain at least two transaction lines (double-entry).');
  }

  // Calculate total debits and credits
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

  // Strict double-entry balance validation: Debits must EQUAL Credits
  const discrepancy = Math.abs(totalDebit - totalCredit);
  if (discrepancy > 0.005) {
    throw new Error(
      `Unbalanced Journal Entry! Total Debits ($${totalDebit.toFixed(2)}) must equal Total Credits ($${totalCredit.toFixed(2)}). Discrepancy: $${discrepancy.toFixed(2)}`
    );
  }

  const entryNumber = `JE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newEntry = {
    id: `je-${Date.now()}`,
    tenantId,
    entryNumber,
    date: date || new Date().toISOString().split('T')[0],
    memo: memo || 'Operational Ledger Posting',
    sourceType,
    sourceId,
    lines,
    totalDebit: Number(totalDebit.toFixed(2)),
    totalCredit: Number(totalCredit.toFixed(2)),
    isBalanced: true,
    status: 'posted',
    postedBy,
    createdAt: new Date().toISOString(),
  };

  // 1. Update running account balances
  await updateAccountBalances(tenantId, lines);

  // 2. Persist Journal Entry
  let savedEntry = newEntry;
  if (getDbStatus().connected) {
    try {
      savedEntry = await JournalEntry.create(newEntry);
    } catch {
      inMemoryJournalEntries.unshift(newEntry);
    }
  } else {
    inMemoryJournalEntries.unshift(newEntry);
  }

  // Invalidate ledger caches
  await redisService.delByPattern(`crm:${tenantId}:ledger:*`);
  await redisService.delByPattern('crm:tenant-universal:ledger:*');

  return savedEntry;
};

/**
 * Updates account balances according to normal balance rules
 */
const updateAccountBalances = async (tenantId, lines) => {
  for (const line of lines) {
    const debit = Number(line.debit) || 0;
    const credit = Number(line.credit) || 0;
    const netDelta = debit - credit;

    // In-memory update
    const memAcc = inMemoryAccounts.find(
      (a) => a.tenantId === tenantId && a.code === String(line.accountCode)
    );
    if (memAcc) {
      if (memAcc.normalBalance === 'debit') {
        memAcc.balance += netDelta;
      } else {
        memAcc.balance += -netDelta; // Credit balance increases with credits
      }
    }

    // Database update
    if (getDbStatus().connected) {
      try {
        const dbAcc = await Account.findOne({ tenantId, code: String(line.accountCode) });
        if (dbAcc) {
          if (dbAcc.normalBalance === 'debit') {
            dbAcc.balance += netDelta;
          } else {
            dbAcc.balance += -netDelta;
          }
          await dbAcc.save();
        }
      } catch {
        // Silently continue
      }
    }
  }
};

/**
 * Auto-post journal entry when a vendor Bill is issued (A/P increase + Expense recognition)
 */
export const postBillCreatedEntry = async (bill) => {
  try {
    const tenantId = bill.tenantId || 'tenant-software';
    await initializeChartOfAccounts(tenantId);

    // Map bill category to expense account
    let expenseCode = '6030'; // G&A
    const cat = (bill.category || '').toLowerCase();
    if (cat.includes('cloud') || cat.includes('host') || cat.includes('ai') || cat.includes('software')) {
      expenseCode = '6010';
    } else if (cat.includes('lease') || cat.includes('rent') || cat.includes('facilities')) {
      expenseCode = '6020';
    } else if (cat.includes('raw') || cat.includes('material') || cat.includes('inventory')) {
      expenseCode = '5010'; // COGS
    }

    const accounts = await getAccounts(tenantId);
    const expenseAcc = accounts.find((a) => a.code === expenseCode) || { name: 'Operating Expenses', code: expenseCode };
    const apAcc = accounts.find((a) => a.code === '2010') || { name: 'Accounts Payable', code: '2010' };

    const amount = Number(bill.amount) || 0;
    if (amount <= 0) return null;

    return await postJournalEntry({
      tenantId,
      date: bill.issueDate || new Date().toISOString().split('T')[0],
      memo: `Bill Invoiced: ${bill.invoiceNumber} - ${bill.title} (${bill.vendorOrClient})`,
      sourceType: 'bill',
      sourceId: bill.id || bill._id || bill.invoiceNumber,
      lines: [
        {
          accountCode: expenseAcc.code,
          accountName: expenseAcc.name,
          debit: amount,
          credit: 0,
          description: `Recognize expense for ${bill.title}`,
        },
        {
          accountCode: apAcc.code,
          accountName: apAcc.name,
          debit: 0,
          credit: amount,
          description: `Accrue payable balance to ${bill.vendorOrClient}`,
        },
      ],
      postedBy: 'Automated Billing Engine',
    });
  } catch (err) {
    console.warn('[Ledger Warning: Bill Created Entry]:', err.message);
    return null;
  }
};

/**
 * Auto-post journal entry when a vendor Bill is paid (A/P decrease + Cash decrease)
 */
export const postBillPaidEntry = async (bill) => {
  try {
    const tenantId = bill.tenantId || 'tenant-software';
    await initializeChartOfAccounts(tenantId);

    const accounts = await getAccounts(tenantId);
    const apAcc = accounts.find((a) => a.code === '2010') || { name: 'Accounts Payable', code: '2010' };
    const cashAcc = accounts.find((a) => a.code === '1010') || { name: 'Cash and Operating Liquidity', code: '1010' };

    const amount = Number(bill.amount) || 0;
    if (amount <= 0) return null;

    return await postJournalEntry({
      tenantId,
      date: new Date().toISOString().split('T')[0],
      memo: `Bill Settlement Remitted: ${bill.invoiceNumber} (${bill.vendorOrClient})`,
      sourceType: 'payment',
      sourceId: bill.id || bill._id || bill.invoiceNumber,
      lines: [
        {
          accountCode: apAcc.code,
          accountName: apAcc.name,
          debit: amount,
          credit: 0,
          description: `Clear payable obligation on ${bill.invoiceNumber}`,
        },
        {
          accountCode: cashAcc.code,
          accountName: cashAcc.name,
          debit: 0,
          credit: amount,
          description: `Disburse cash settlement via ${bill.paymentMethod || 'Wire Transfer'}`,
        },
      ],
      postedBy: 'Treasury Settlement Engine',
    });
  } catch (err) {
    console.warn('[Ledger Warning: Bill Paid Entry]:', err.message);
    return null;
  }
};

/**
 * Auto-post journal entry when a Sale deal is won (A/R increase + Revenue recognition)
 */
export const postSaleWonEntry = async (sale) => {
  try {
    const tenantId = sale.tenantId || 'tenant-software';
    await initializeChartOfAccounts(tenantId);

    const accounts = await getAccounts(tenantId);
    const arAcc = accounts.find((a) => a.code === '1020') || { name: 'Accounts Receivable', code: '1020' };

    const isSaaS = sale.businessType === 'software';
    const revCode = isSaaS ? '4020' : '4010';
    const revAcc = accounts.find((a) => a.code === revCode) || {
      name: isSaaS ? 'SaaS Recurring Subscription Revenue' : 'Commercial Sales Revenue',
      code: revCode,
    };

    const amount = Number(sale.amount) || 0;
    if (amount <= 0) return null;

    return await postJournalEntry({
      tenantId,
      date: sale.expectedCloseDate || new Date().toISOString().split('T')[0],
      memo: `Deal Closed Won: ${sale.dealName} (${sale.customerName})`,
      sourceType: 'sale',
      sourceId: sale.id || sale._id || sale.dealName,
      lines: [
        {
          accountCode: arAcc.code,
          accountName: arAcc.name,
          debit: amount,
          credit: 0,
          description: `Record accounts receivable for ${sale.customerName}`,
        },
        {
          accountCode: revAcc.code,
          accountName: revAcc.name,
          debit: 0,
          credit: amount,
          description: `Recognize earned revenue on ${sale.dealName}`,
        },
      ],
      postedBy: 'Revenue Recognition Engine',
    });
  } catch (err) {
    console.warn('[Ledger Warning: Sale Won Entry]:', err.message);
    return null;
  }
};

/**
 * Generate Real-Time Balance Sheet Statement
 * Assets = Liabilities + Equity
 */
export const generateBalanceSheet = async (tenantId) => {
  const accounts = await getAccounts(tenantId);

  const assets = accounts.filter((a) => a.type === 'asset');
  const liabilities = accounts.filter((a) => a.type === 'liability');
  const equityAccounts = accounts.filter((a) => a.type === 'equity');

  const totalAssets = assets.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  // Compute Current Year Retained Earnings (Net Income from Income Statement)
  const revenueTotal = accounts.filter((a) => a.type === 'revenue').reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const cogsTotal = accounts.filter((a) => a.type === 'cogs').reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const expenseTotal = accounts.filter((a) => a.type === 'expense').reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const netIncome = revenueTotal - cogsTotal - expenseTotal;

  const baseEquity = equityAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const totalEquity = baseEquity + netIncome;

  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.05;

  return {
    asOfDate: new Date().toISOString().split('T')[0],
    tenantId,
    assets: {
      accounts: assets.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
      total: Number(totalAssets.toFixed(2)),
    },
    liabilities: {
      accounts: liabilities.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
      total: Number(totalLiabilities.toFixed(2)),
    },
    equity: {
      accounts: [
        ...equityAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
        { code: '3999', name: 'Net Operating Income (Current Period)', balance: Number(netIncome.toFixed(2)) },
      ],
      total: Number(totalEquity.toFixed(2)),
    },
    equationVerification: {
      totalAssets: Number(totalAssets.toFixed(2)),
      totalLiabilitiesAndEquity: Number((totalLiabilities + totalEquity).toFixed(2)),
      isBalanced,
      variance: Number((totalAssets - (totalLiabilities + totalEquity)).toFixed(2)),
    },
  };
};

/**
 * Generate Real-Time Income Statement (Profit & Loss)
 * Net Income = Revenue - COGS - Expenses
 */
export const generateIncomeStatement = async (tenantId) => {
  const accounts = await getAccounts(tenantId);

  const revenues = accounts.filter((a) => a.type === 'revenue');
  const cogs = accounts.filter((a) => a.type === 'cogs');
  const expenses = accounts.filter((a) => a.type === 'expense');

  const totalRevenue = revenues.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const totalCogs = cogs.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const grossProfit = totalRevenue - totalCogs;
  const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '100.0';

  const totalExpenses = expenses.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const netOperatingIncome = grossProfit - totalExpenses;
  const netMarginPct = totalRevenue > 0 ? ((netOperatingIncome / totalRevenue) * 100).toFixed(1) : '0.0';

  return {
    period: `FY ${new Date().getFullYear()} - YTD`,
    tenantId,
    revenue: {
      accounts: revenues.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
      total: Number(totalRevenue.toFixed(2)),
    },
    cogs: {
      accounts: cogs.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
      total: Number(totalCogs.toFixed(2)),
    },
    grossProfit: Number(grossProfit.toFixed(2)),
    grossMarginPercent: `${grossMarginPct}%`,
    operatingExpenses: {
      accounts: expenses.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
      total: Number(totalExpenses.toFixed(2)),
    },
    netOperatingIncome: Number(netOperatingIncome.toFixed(2)),
    netMarginPercent: `${netMarginPct}%`,
  };
};

/**
 * Generate Trial Balance Verification (All Debits == All Credits)
 */
export const generateTrialBalance = async (tenantId) => {
  const accounts = await getAccounts(tenantId);

  let totalDebitBalance = 0;
  let totalCreditBalance = 0;

  const rows = accounts.map((acc) => {
    let debitBal = 0;
    let creditBal = 0;

    if (acc.normalBalance === 'debit') {
      if (acc.balance >= 0) debitBal = acc.balance;
      else creditBal = Math.abs(acc.balance);
    } else {
      if (acc.balance >= 0) creditBal = acc.balance;
      else debitBal = Math.abs(acc.balance);
    }

    totalDebitBalance += debitBal;
    totalCreditBalance += creditBal;

    return {
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debit: Number(debitBal.toFixed(2)),
      credit: Number(creditBal.toFixed(2)),
    };
  });

  return {
    asOfDate: new Date().toISOString().split('T')[0],
    tenantId,
    rows,
    totalDebit: Number(totalDebitBalance.toFixed(2)),
    totalCredit: Number(totalCreditBalance.toFixed(2)),
    isBalanced: Math.abs(totalDebitBalance - totalCreditBalance) < 0.05,
  };
};

/**
 * Get all Journal Entries for a tenant
 */
export const getJournalEntries = async (tenantId, limit = 50) => {
  if (getDbStatus().connected) {
    try {
      const isUniversal = tenantId === 'tenant-universal';
      const query = isUniversal ? {} : { tenantId };
      return await JournalEntry.find(query).sort({ createdAt: -1 }).limit(limit);
    } catch {
      // Fallback
    }
  }

  const isUniversal = tenantId === 'tenant-universal';
  return isUniversal
    ? inMemoryJournalEntries.slice(0, limit)
    : inMemoryJournalEntries.filter((j) => j.tenantId === tenantId).slice(0, limit);
};
