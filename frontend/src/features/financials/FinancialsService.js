import { apiClient } from '../../core/services/apiClient';

export const financialsService = {
  async getExecutiveHealth(fresh = false) {
    try {
      const endpoint = fresh
        ? '/ledger/analytics/executive-summary?refresh=true'
        : '/ledger/analytics/executive-summary';
      const res = await apiClient.get(endpoint);
      return res.data;
    } catch (err) {
      console.warn('[FinancialsService getExecutiveHealth fallback]:', err.message);
      // Zero-state clean fallback metrics
      return {
        asOfDate: new Date().toISOString().split('T')[0],
        headlineKpis: {
          ebitda: { value: 0, formatted: '$0', margin: '0.0%', trend: '0.0%' },
          netProfit: { value: 0, formatted: '$0', margin: '0.0%', trend: '0.0%' },
          netWorth: { value: 0, formatted: '$0', description: 'Assets minus Liabilities', trend: '0.0%' },
          roi: { value: 0, formatted: '0.0%', label: 'Return on Investment (ROI)', trend: '0.0%' },
          enterpriseValuation: { value: 0, formatted: '$0', multiple: '0x EBITDA', trend: '0.0%' },
        },
        profitability: {
          grossRevenue: 0,
          cogs: 0,
          grossProfit: 0,
          grossMarginPct: '0.0%',
          operatingExpenses: 0,
          ebit: 0,
          depreciationAndAmortization: 0,
          ebitda: 0,
          ebitdaMarginPct: '0.0%',
          taxExpense: 0,
          interestExpense: 0,
          netProfit: 0,
          netProfitMarginPct: '0.0%',
        },
        efficiencyAndReturns: {
          roi: '0.0%',
          roa: '0.0%',
          roe: '0.0%',
          revenuePerEmployee: '$0',
          assetTurnover: 0,
        },
        balanceSheetOverview: {
          totalAssets: 0,
          totalLiabilities: 0,
          netWorth: 0,
          cashAndEquivalents: 0,
          accountsReceivable: 0,
          accountsPayable: 0,
        },
        liquidityAndSolvency: {
          currentRatio: 0,
          currentRatioStatus: 'Clean Ledger',
          quickRatio: 0,
          quickRatioStatus: 'Clean Ledger',
          debtToEquityRatio: 0,
          debtToEquityStatus: 'Zero Debt',
          monthlyBurnRate: 0,
          cashRunwayMonths: 0,
          cashRunwayStatus: 'Clean Ledger',
          operatingCashFlow: 0,
          freeCashFlow: 0,
        },
        valuationMultiples: {
          ebitdaMultiple: '0.0x',
          valuationByEbitda: 0,
          revenueMultiple: '0.0x',
          valuationByRevenue: 0,
          estimatedEnterpriseValue: 0,
          peRatioEstimated: 0,
        },
      };
    }
  },

  async getBalanceSheet() {
    try {
      const res = await apiClient.get('/ledger/statements/balance-sheet');
      return res.data;
    } catch {
      return null;
    }
  },

  async getIncomeStatement() {
    try {
      const res = await apiClient.get('/ledger/statements/income-statement');
      return res.data;
    } catch {
      return null;
    }
  },
};

export default financialsService;
