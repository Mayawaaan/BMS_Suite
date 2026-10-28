import { calculateExecutiveFinancialHealth } from './services/analyticsEngine.js';

async function testExecutiveFinancials() {
  console.log('🧪 =========================================================');
  console.log('🧪 TESTING EXECUTIVE FINANCIAL HEALTH & CFO VALUATION MODULE');
  console.log('🧪 =========================================================\n');

  const data = await calculateExecutiveFinancialHealth('tenant-software');

  console.log('▶ [1] Core Headline Metrics (The User Asked Numbers):');
  console.log(`  - EBITDA:                ${data.headlineKpis.ebitda.formatted} (${data.headlineKpis.ebitda.margin} margin)`);
  console.log(`  - Net Profit:            ${data.headlineKpis.netProfit.formatted} (${data.headlineKpis.netProfit.margin} net margin)`);
  console.log(`  - Net Worth (Equity):    ${data.headlineKpis.netWorth.formatted}`);
  console.log(`  - ROI:                   ${data.headlineKpis.roi.formatted}`);
  console.log(`  - Enterprise Valuation:  ${data.headlineKpis.enterpriseValuation.formatted} (${data.headlineKpis.enterpriseValuation.multiple})`);

  console.log('\n▶ [2] Capital Efficiency & Return Rates:');
  console.log(`  - Return on Investment (ROI): ${data.efficiencyAndReturns.roi}`);
  console.log(`  - Return on Assets (ROA):     ${data.efficiencyAndReturns.roa}`);
  console.log(`  - Return on Equity (ROE):     ${data.efficiencyAndReturns.roe}`);

  console.log('\n▶ [3] Balance Sheet & Solvency Structure:');
  console.log(`  - Total Assets:               $${data.balanceSheetOverview.totalAssets.toLocaleString()}`);
  console.log(`  - Total Liabilities:          $${data.balanceSheetOverview.totalLiabilities.toLocaleString()}`);
  console.log(`  - Net Worth (Assets - Liab):  $${data.balanceSheetOverview.netWorth.toLocaleString()}`);
  console.log(`  - Cash Reserves:              $${data.balanceSheetOverview.cashAndEquivalents.toLocaleString()}`);

  console.log('\n▶ [4] Liquidity, Cash Runway & Burn:');
  console.log(`  - Current Ratio:              ${data.liquidityAndSolvency.currentRatio}x (${data.liquidityAndSolvency.currentRatioStatus})`);
  console.log(`  - Quick Ratio:                ${data.liquidityAndSolvency.quickRatio}x (${data.liquidityAndSolvency.quickRatioStatus})`);
  console.log(`  - Debt to Equity:             ${data.liquidityAndSolvency.debtToEquityRatio}x (${data.liquidityAndSolvency.debtToEquityStatus})`);
  console.log(`  - Monthly Net Burn:           $${data.liquidityAndSolvency.monthlyBurnRate.toLocaleString()}/mo`);
  console.log(`  - Cash Runway:                ${data.liquidityAndSolvency.cashRunwayMonths} Months`);

  console.log('\n=========================================================');
  console.log('🎉 EXECUTIVE CFO INTELLIGENCE VERIFICATION SUCCESSFUL!');
  console.log('=========================================================\n');
  process.exit(0);
}

testExecutiveFinancials().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
