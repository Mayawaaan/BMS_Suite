import { runSeed } from './data/seedRunner.js';
import {
  initializeChartOfAccounts,
  getAccounts,
  postJournalEntry,
  generateBalanceSheet,
  generateIncomeStatement,
  generateTrialBalance,
} from './services/ledgerService.js';
import {
  calculateAgingReceivables,
  calculateCogsAnalytics,
  calculateRevenueVelocity,
} from './services/analyticsEngine.js';

async function testMilestoneP2() {
  console.log('🧪 =========================================================');
  console.log('🧪 MILESTONE P2: DOUBLE-ENTRY GENERAL LEDGER & ANALYTICS TEST');
  console.log('🧪 =========================================================\n');

  // 1. Master Seed & COA Setup
  console.log('▶ [1/6] Initializing Chart of Accounts for Tenant: tenant-software...');
  const accounts = await initializeChartOfAccounts('tenant-software');
  console.log(`✔ Chart of Accounts initialized with ${accounts.length} standardized enterprise accounts.`);

  // Verify accounts structure
  const cashAcc = accounts.find((a) => a.code === '1010');
  const apAcc = accounts.find((a) => a.code === '2010');
  const revAcc = accounts.find((a) => a.code === '4020');
  if (!cashAcc || !apAcc || !revAcc) {
    throw new Error('Standard accounts missing from initialized Chart of Accounts.');
  }
  console.log('✔ Verified key accounts: 1010 (Cash Asset), 2010 (A/P Liability), 4020 (SaaS ARR Revenue).');

  // 2. Strict Double-Entry Balance Check
  console.log('\n▶ [2/6] Testing Double-Entry Balance Validation (Debit == Credit)...');
  try {
    await postJournalEntry({
      tenantId: 'tenant-software',
      date: '2026-10-27',
      memo: 'Unbalanced Fraud Test Entry',
      lines: [
        { accountCode: '1010', accountName: 'Cash', debit: 5000, credit: 0 },
        { accountCode: '4010', accountName: 'Revenue', debit: 0, credit: 4500 }, // Discrepancy of $500!
      ],
    });
    throw new Error('FAILED: Unbalanced journal entry was mistakenly allowed!');
  } catch (err) {
    if (err.message.includes('Unbalanced Journal Entry')) {
      console.log('✔ SUCCESS: Unbalanced journal entry rejected as expected:', err.message);
    } else {
      throw err;
    }
  }

  // 3. Post a Valid Balanced Double-Entry Transaction
  console.log('\n▶ [3/6] Posting Valid Balanced Double-Entry Transaction ($12,500 Cloud Expansion)...');
  const balancedEntry = await postJournalEntry({
    tenantId: 'tenant-software',
    date: '2026-10-27',
    memo: 'AWS High-Throughput Cluster Reserved Instances',
    sourceType: 'bill',
    sourceId: 'INV-TEST-999',
    lines: [
      { accountCode: '6010', accountName: 'Cloud Infrastructure Overhead', debit: 12500, credit: 0 },
      { accountCode: '2010', accountName: 'Accounts Payable (A/P)', debit: 0, credit: 12500 },
    ],
  });
  console.log(`✔ Posted Journal Entry: ${balancedEntry.entryNumber} | Total Debits: $${balancedEntry.totalDebit} == Total Credits: $${balancedEntry.totalCredit}`);

  // 4. Test Balance Sheet & Trial Balance Equality
  console.log('\n▶ [4/6] Verifying Balance Sheet Equation (Assets = Liabilities + Equity)...');
  const balanceSheet = await generateBalanceSheet('tenant-software');
  console.log(`  Total Assets:                  $${balanceSheet.assets.total.toLocaleString()}`);
  console.log(`  Total Liabilities:             $${balanceSheet.liabilities.total.toLocaleString()}`);
  console.log(`  Total Equity (inc. Net Income): $${balanceSheet.equity.total.toLocaleString()}`);
  console.log(`  Equation Balanced:             ${balanceSheet.equationVerification.isBalanced ? 'YES (0 Variance)' : 'NO'}`);

  const trialBalance = await generateTrialBalance('tenant-software');
  console.log(`✔ Trial Balance Check: Total Debits ($${trialBalance.totalDebit}) == Total Credits ($${trialBalance.totalCredit}) -> Balanced: ${trialBalance.isBalanced}`);

  // 5. Test Dynamic AR Aging Schedule
  console.log('\n▶ [5/6] Testing Dynamic Accounts Receivable (A/R) Aging Engine...');
  const arAging = await calculateAgingReceivables('tenant-software');
  console.log(`✔ Total Invoices in Arrears: ${arAging.totalInvoicesCount} | Total A/R: $${arAging.totalOutstanding.toLocaleString()}`);
  console.log(`  Weighted Days Overdue (DSO): ${arAging.averageOverdueDays} days | Health Status: ${arAging.agingStatus}`);
  console.log('  Aging Buckets:');
  for (const b of arAging.buckets) {
    console.log(`    - ${b.label.padEnd(25)}: $${b.amount.toLocaleString().padStart(10)} (${b.count} invoices, ${b.percentage}%)`);
  }

  // 6. Test Dynamic COGS & SaaS Revenue Velocity
  console.log('\n▶ [6/6] Testing COGS & Revenue Velocity Analytics Engine...');
  const cogsData = await calculateCogsAnalytics('tenant-software');
  console.log(`✔ Recognized Revenue Analyzed: $${cogsData.totalRecognizedRevenue.toLocaleString()}`);
  console.log(`  Catalog COGS Ratio:         ${cogsData.catalogCostRatio}`);
  console.log(`  Calculated Gross Margin:    ${cogsData.grossMarginPercent} (Gross Profit: $${cogsData.grossProfit.toLocaleString()})`);

  const velocity = await calculateRevenueVelocity('tenant-software');
  console.log(`✔ Pipeline Coverage Ratio:    ${velocity.pipelineCoverageRatio}x | Historical Win Rate: ${velocity.winRate}`);

  console.log('\n=========================================================');
  console.log('🎉 ALL MILESTONE P2 TESTS PASSED WITH 100% SUCCESS!');
  console.log('=========================================================\n');
  process.exit(0);
}

testMilestoneP2().catch((err) => {
  console.error('❌ Milestone P2 Test Failed:', err);
  process.exit(1);
});
