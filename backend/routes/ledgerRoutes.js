import express from 'express';
import {
  getChartOfAccounts,
  getJournal,
  createJournalEntry,
  getBalanceSheet,
  getIncomeStatement,
  getTrialBalance,
  getAgingSchedule,
  getCogsMetrics,
  getRevenueVelocityMetrics,
  getExecutiveFinancialSummary,
} from '../controllers/ledgerController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// General Ledger Accounts & Journal Entries
router.get('/accounts', getChartOfAccounts);
router.get('/journal', getJournal);
router.post('/journal', requireRole('superadmin', 'admin', 'manager'), createJournalEntry);

// Standard Financial Statements
router.get('/statements/balance-sheet', getBalanceSheet);
router.get('/statements/income-statement', getIncomeStatement);
router.get('/statements/trial-balance', getTrialBalance);

// Algorithmic Analytics
router.get('/analytics/aging', getAgingSchedule);
router.get('/analytics/cogs', getCogsMetrics);
router.get('/analytics/velocity', getRevenueVelocityMetrics);
router.get('/analytics/executive-summary', getExecutiveFinancialSummary);

export default router;
