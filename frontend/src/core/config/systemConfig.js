// Centralized System Configuration: Roles, Statuses, Navigation, and Semantic Design Tokens
// Ensures zero hardcoded roles, colors, or status badges across the platform.

export const APP_CONFIG = {
  name: 'ZSYIO BMS',
  shortName: 'ZSYIO BMS',
  version: 'v2.4',
  tagline: 'Enterprise Operations, Multi-Tenant Invoicing, Sales, Stock & Financials',
  taxId: 'ZSYIO-EIN-94-3829104',
  supportEmail: 'ops@zsyio.io',
};

export const SYSTEM_ROLES = {
  superadmin: {
    id: 'superadmin',
    label: 'Super Admin',
    shortLabel: 'Superadmin',
    badge: 'Supreme Access',
    badgeClass: 'badge-danger',
    desc: 'Platform architect with direct Redis cache control, master database seeding & user governance.',
  },
  admin: {
    id: 'admin',
    label: 'Executive Admin',
    shortLabel: 'Admin',
    badge: 'Full Access',
    badgeClass: 'badge-brand',
    desc: 'Universal control over all modules, finances, settings & records.',
  },
  manager: {
    id: 'manager',
    label: 'Operations Manager',
    shortLabel: 'Manager',
    badge: 'Management',
    badgeClass: 'badge-warning',
    desc: 'Module level authority, sales approvals, catalog management & restocks.',
  },
  staff: {
    id: 'staff',
    label: 'Frontline Staff',
    shortLabel: 'Staff',
    badge: 'Standard',
    badgeClass: 'badge-success',
    desc: 'Daily order logging, counter receipts, inventory lookups & customer onboarding.',
  },
  auditor: {
    id: 'auditor',
    label: 'Compliance Auditor',
    shortLabel: 'Auditor',
    badge: 'Read-Only',
    badgeClass: 'badge-info',
    desc: 'Read-only financial ledger compliance, tax reporting & audit exports.',
  },
};

export const ROLES_LIST = Object.values(SYSTEM_ROLES);

export const getRoleInfo = (roleId) => {
  return SYSTEM_ROLES[roleId] || {
    id: roleId || 'user',
    label: (roleId || 'user').toUpperCase(),
    shortLabel: roleId || 'User',
    badge: 'User',
    badgeClass: 'badge-neutral',
    desc: 'Standard platform user.',
  };
};

export const SYSTEM_STATUSES = {
  // Invoices & Bills
  paid: { id: 'paid', label: 'PAID IN FULL', badgeClass: 'badge-success' },
  pending: { id: 'pending', label: 'PENDING', badgeClass: 'badge-warning' },
  overdue: { id: 'overdue', label: 'OVERDUE', badgeClass: 'badge-danger' },
  cancelled: { id: 'cancelled', label: 'CANCELLED', badgeClass: 'badge-neutral' },

  // Sales Pipeline
  closed_won: { id: 'closed_won', label: 'CLOSED WON', badgeClass: 'badge-success' },
  proposal: { id: 'proposal', label: 'PROPOSAL SENT', badgeClass: 'badge-brand' },
  qualified: { id: 'qualified', label: 'QUALIFIED', badgeClass: 'badge-info' },
  prospect: { id: 'prospect', label: 'PROSPECT', badgeClass: 'badge-neutral' },
  closed_lost: { id: 'closed_lost', label: 'CLOSED LOST', badgeClass: 'badge-danger' },

  // Customers
  active: { id: 'active', label: 'ACTIVE', badgeClass: 'badge-success' },
  lead: { id: 'lead', label: 'NEW LEAD', badgeClass: 'badge-info' },
  churned: { id: 'churned', label: 'CHURNED', badgeClass: 'badge-danger' },

  // Inventory Stock
  in_stock: { id: 'in_stock', label: 'IN STOCK', badgeClass: 'badge-success' },
  low_stock: { id: 'low_stock', label: 'LOW STOCK', badgeClass: 'badge-warning' },
  out_of_stock: { id: 'out_of_stock', label: 'DEPLETED', badgeClass: 'badge-danger' },

  // Generic
  draft: { id: 'draft', label: 'DRAFT', badgeClass: 'badge-neutral' },
};

export const getStatusInfo = (status) => {
  if (!status) return { label: 'UNKNOWN', badgeClass: 'badge-neutral' };
  const normalized = String(status).toLowerCase().replace(/[-\s]/g, '_');
  return SYSTEM_STATUSES[normalized] || {
    id: normalized,
    label: String(status).toUpperCase().replace(/_/g, ' '),
    badgeClass: 'badge-neutral',
  };
};

export const PLAN_TIERS = {
  starter: { id: 'starter', label: 'Starter Hub', price: '$29/mo', maxSkus: 500, maxBusinesses: 1 },
  growth: { id: 'growth', label: 'Growth Enterprise', price: '$99/mo', maxSkus: 5000, maxBusinesses: 3 },
  enterprise: { id: 'enterprise', label: 'Unlimited Suite', price: '$299/mo', maxSkus: 100000, maxBusinesses: 99 },
};

export const PLAN_TIERS_LIST = Object.values(PLAN_TIERS);

export const getPlanInfo = (tierId) => {
  return PLAN_TIERS[tierId] || PLAN_TIERS.starter;
};

// Filter presets
export const BILL_STATUS_FILTERS = [
  { id: 'all', label: 'All Bills' },
  { id: 'pending', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
];

export const CUSTOMER_STATUS_FILTERS = [
  { id: 'all', label: 'All Accounts' },
  { id: 'active', label: 'Active' },
  { id: 'lead', label: 'Leads' },
  { id: 'churned', label: 'Churned' },
];

export const PIPELINE_STAGES = [
  { id: 'prospect', label: 'Prospecting', badgeClass: 'badge-neutral', defaultProb: 25 },
  { id: 'qualified', label: 'Qualified Need', badgeClass: 'badge-info', defaultProb: 50 },
  { id: 'proposal', label: 'Proposal Sent', badgeClass: 'badge-brand', defaultProb: 75 },
  { id: 'closed_won', label: 'Closed & Won', badgeClass: 'badge-success', defaultProb: 100 },
];

export const PAYMENT_METHODS = [
  { id: 'Corporate Wire', label: 'Corporate Wire (NEFT/RTGS/Fedwire)' },
  { id: 'ACH Transfer', label: 'ACH Direct Settlement' },
  { id: 'Credit Card', label: 'Corporate Purchasing Card' },
  { id: 'Letter of Credit', label: 'Letter of Credit (LC / EPC)' },
  { id: 'UPI / Cash', label: 'UPI / Immediate Cash Settlement' },
  { id: 'Net 30 Terms', label: 'Net 30 Commercial Invoice' },
];

export const QUICK_ACTIONS = [
  {
    id: 'bills',
    icon: '🧾',
    getLabel: (t) => `New ${t.bills ? t.bills.split('&')[0].trim() : 'Bill'}`,
    getDesc: () => 'Record payable invoice, vendor bill or supplier receipt',
  },
  {
    id: 'sales',
    icon: '💼',
    getLabel: (t) => `New ${t.dealUnit || 'Deal'}`,
    getDesc: () => 'Log counter order, contract tender or pipeline deal',
  },
  {
    id: 'products',
    icon: '📦',
    getLabel: (t) => `New ${t.productUnit || 'Item'}`,
    getDesc: () => 'Configure item pricing, specs, barcode or license tier',
  },
  {
    id: 'customers',
    icon: '👥',
    getLabel: (t) => `New ${t.customerUnit || 'Account'}`,
    getDesc: () => 'Onboard client, shopper, distributor or enterprise lead',
  },
  {
    id: 'stock',
    icon: '🏭',
    spanCol: true,
    getLabel: (t) => `Restock ${t.stock ? t.stock.split('&')[0].trim() : 'Inventory'}`,
    getDesc: () => 'Dispatch restock to fulfillment shelf, plant depot or warehouse',
  },
];
