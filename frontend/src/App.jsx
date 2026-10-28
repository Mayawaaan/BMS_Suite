import React, { useState } from 'react';
import { SmoothScrollProvider } from './core/providers/SmoothScrollProvider';
import { BusinessProfileProvider, useBusinessProfile } from './core/contexts/BusinessProfileContext';
import { AuthProvider, useAuth } from './core/contexts/AuthContext';
import { MainLayout } from './core/layout/MainLayout';
import { Modal } from './shared/components/Modal';
import { QUICK_ACTIONS, APP_CONFIG } from './core/config/systemConfig';

// Auth
import { LoginView } from './features/auth/LoginView';

// Features
import { DashboardView } from './features/dashboard/DashboardView';
import { BillsView } from './features/bills/BillsView';
import { SalesView } from './features/sales/SalesView';
import { ProductsView } from './features/products/ProductsView';
import { RevenueView } from './features/revenue/RevenueView';
import { CustomersView } from './features/customers/CustomersView';
import { StockView } from './features/stock/StockView';
import { FinancialsView } from './features/financials/FinancialsView';
import { PlatformAdminView } from './features/superadmin/PlatformAdminView';
import { PaymentsView } from './features/payments/PaymentsView';
import { EmployeesView } from './features/employees/EmployeesView';
import { MultipleBusinessView } from './features/multibusiness/MultipleBusinessView';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [triggerBillCreate, setTriggerBillCreate] = useState(false);
  const { activeProfile, terminology } = useBusinessProfile();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return `${activeProfile.shortName} Telemetry & Pulse`;
      case 'financials':
        return 'CFO Financial Health, Net Worth & Valuation';
      case 'bills':
        return terminology.bills || 'Bills & Accounts Payable';
      case 'sales':
        return terminology.sales || 'Sales Opportunities & Pipeline';
      case 'products':
        return terminology.products || 'Product Catalog & Pricing';
      case 'revenue':
        return terminology.revenue || 'Revenue & Analytics';
      case 'customers':
        return terminology.customers || 'Customer Accounts';
      case 'stock':
        return terminology.stock || 'Stock & Global Inventory';
      case 'payments':
        return 'Payments & Subscriptions';
      case 'multibusiness':
        return 'Multi-Business Portfolio Hub & Operations';
      case 'employees':
        return `${user?.companyName || 'Company'} Workforce & Employee Governance`;
      case 'admin_panel':
        return 'BMS Platform Governance & Control';
      default:
        return APP_CONFIG.name;
    }
  };

  const handleQuickSelect = (tabKey) => {
    setActiveTab(tabKey);
    setIsQuickActionOpen(false);
    if (tabKey === 'bills') {
      setTriggerBillCreate(true);
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      activeTitle={getTitle()}
      onOpenQuickAction={() => setIsQuickActionOpen(true)}
    >
      {activeTab === 'dashboard' && <DashboardView onNavigateTab={setActiveTab} />}
      {activeTab === 'financials' && <FinancialsView />}
      {activeTab === 'bills' && (
        <BillsView
          initialCreateOpen={triggerBillCreate}
          onClearInitialCreate={() => setTriggerBillCreate(false)}
        />
      )}
      {activeTab === 'sales' && <SalesView />}
      {activeTab === 'products' && <ProductsView />}
      {activeTab === 'revenue' && <RevenueView />}
      {activeTab === 'customers' && <CustomersView />}
      {activeTab === 'stock' && <StockView />}
      {activeTab === 'payments' && <PaymentsView />}
      {activeTab === 'multibusiness' && <MultipleBusinessView onNavigateTab={setActiveTab} />}
      {activeTab === 'employees' && (user?.role === 'admin' || user?.role === 'superadmin') && <EmployeesView />}
      {activeTab === 'admin_panel' && user?.role === 'superadmin' && <PlatformAdminView />}

      {/* Global Quick Action Modal */}
      <Modal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        title={`New ${activeProfile.shortName} Transaction`}
        subtitle={`Select an operational module to record new activity in ${activeProfile.name}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickSelect(action.id)}
              className={`flex items-start gap-3 p-4 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF6EF] border border-[var(--border-color)] hover:border-[#9A3412]/40 text-left transition-all group shadow-xs ${
                action.spanCol ? 'sm:col-span-2' : ''
              }`}
            >
              <span className="text-xl">{action.icon}</span>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#9A3412] transition-colors">
                  {action.getLabel(terminology)}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {action.getDesc(terminology)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </MainLayout>
  );
}

export function App() {
  return (
    <BusinessProfileProvider>
      <AuthProvider>
        <SmoothScrollProvider>
          <AppContent />
        </SmoothScrollProvider>
      </AuthProvider>
    </BusinessProfileProvider>
  );
}

export default App;
