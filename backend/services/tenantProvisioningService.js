import { Tenant } from '../models/Tenant.js';
import { Product } from '../models/Product.js';
import { Bill } from '../models/Bill.js';
import { Sale } from '../models/Sale.js';
import { Customer } from '../models/Customer.js';
import { Stock } from '../models/Stock.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { PLAN_TIER_CONFIG } from '../middleware/subscriptionGuard.js';
import { addInMemoryTenant } from '../middleware/tenantMiddleware.js';
import { addInMemoryProducts } from '../controllers/productController.js';
import { addInMemoryBills } from '../controllers/billController.js';
import { addInMemorySales } from '../controllers/saleController.js';
import { addInMemoryCustomers } from '../controllers/customerController.js';
import { addInMemoryStock } from '../controllers/stockController.js';
import { initializeChartOfAccounts, postBillCreatedEntry, postSaleWonEntry } from './ledgerService.js';

/**
 * Generates custom starter data tailored specifically to a business's name and vertical
 */
const generateStarterData = (tenantId, companyName, vertical) => {
  const v = vertical || 'software';
  const prefix = companyName || 'Business';
  const now = new Date();
  const pastDate = new Date(now.getTime() - 14 * 86400000).toISOString().split('T')[0];
  const dueDate = new Date(now.getTime() + 14 * 86400000).toISOString().split('T')[0];

  let products = [];
  let bills = [];
  let sales = [];
  let customers = [];
  let stock = [];

  if (v === 'shop') {
    products = [
      { id: `prod-${tenantId}-1`, tenantId, name: `${prefix} Signature House Blend (1kg)`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-101`, category: 'Store Goods', price: 28, costPrice: 11, stockQty: 140, minStockLevel: 25, status: 'in_stock', businessType: 'shop' },
      { id: `prod-${tenantId}-2`, tenantId, name: `${prefix} Single-Origin Dark Roast`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-102`, category: 'Store Goods', price: 34, costPrice: 14, stockQty: 85, minStockLevel: 20, status: 'in_stock', businessType: 'shop' },
      { id: `prod-${tenantId}-3`, tenantId, name: `${prefix} Artisan Bakery & Pastry Tray`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-103`, category: 'Fresh Daily', price: 18, costPrice: 7, stockQty: 30, minStockLevel: 10, status: 'in_stock', businessType: 'shop' },
      { id: `prod-${tenantId}-4`, tenantId, name: `${prefix} Insulated Ceramic Tumbler`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-104`, category: 'Merchandise', price: 32, costPrice: 12, stockQty: 50, minStockLevel: 15, status: 'in_stock', businessType: 'shop' },
    ];
    bills = [
      { id: `bill-${tenantId}-1`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-1`, title: `${prefix} Main Street Storefront Lease`, vendorOrClient: 'Beacon Commercial Properties', amount: 4200, dueDate, category: 'Facilities', status: 'paid', paymentMethod: 'ACH Transfer', businessType: 'shop' },
      { id: `bill-${tenantId}-2`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-2`, title: 'Direct Farm Raw Bean Shipment', vendorOrClient: 'Verde Valley Organics', amount: 2650, dueDate, category: 'Supplies', status: 'pending', paymentMethod: 'Corporate Wire', businessType: 'shop' },
      { id: `bill-${tenantId}-3`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-3`, title: 'Store POS Terminal & Card Processing Fee', vendorOrClient: 'Global Merchant Payments', amount: 380, dueDate: pastDate, category: 'Overheads', status: 'paid', paymentMethod: 'Credit Card', businessType: 'shop' },
    ];
    sales = [
      { id: `sale-${tenantId}-1`, tenantId, dealName: 'Weekly Retail Counter Sales Batch', customerName: 'Walk-in Retail Shoppers', amount: 8400, stage: 'closed_won', closeDate: pastDate, probability: 100, businessType: 'shop' },
      { id: `sale-${tenantId}-2`, tenantId, dealName: 'Corporate Office Coffee Subscription', customerName: 'Apex Capital Advisors', amount: 2400, stage: 'closed_won', closeDate: pastDate, probability: 100, businessType: 'shop' },
      { id: `sale-${tenantId}-3`, tenantId, dealName: 'Weekend Farmer Market Catering Contract', customerName: 'Community Events Co.', amount: 1650, stage: 'proposal', closeDate: dueDate, probability: 60, businessType: 'shop' },
    ];
    customers = [
      { id: `cust-${tenantId}-1`, tenantId, name: 'Apex Capital Advisors', email: 'accounts@apexcapital.org', company: 'Apex Capital', phone: '+1 555-201-9988', status: 'active', lifetimeValue: 2400, businessType: 'shop' },
      { id: `cust-${tenantId}-2`, tenantId, name: 'Lucas Miller (VIP Shopper)', email: 'lucas.m@email.com', company: 'Independent', phone: '+1 555-884-3321', status: 'active', lifetimeValue: 720, businessType: 'shop' },
      { id: `cust-${tenantId}-3`, tenantId, name: 'Downtown Design Collective', email: 'studio@downtowndesign.io', company: 'Design Collective', phone: '+1 555-901-4422', status: 'lead', lifetimeValue: 0, businessType: 'shop' },
    ];
    stock = [
      { id: `stk-${tenantId}-1`, tenantId, productName: `${prefix} Signature House Blend (1kg)`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-101`, warehouse: 'Store Counter Rack A', currentStock: 140, reservedStock: 10, minThreshold: 25, status: 'in_stock', businessType: 'shop' },
      { id: `stk-${tenantId}-2`, tenantId, productName: `${prefix} Single-Origin Dark Roast`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-102`, warehouse: 'Backroom Storage Bay 2', currentStock: 85, reservedStock: 5, minThreshold: 20, status: 'in_stock', businessType: 'shop' },
      { id: `stk-${tenantId}-3`, tenantId, productName: `${prefix} Insulated Ceramic Tumbler`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-104`, warehouse: 'Merch Display Counter', currentStock: 50, reservedStock: 2, minThreshold: 15, status: 'in_stock', businessType: 'shop' },
    ];
  } else if (v === 'factory') {
    products = [
      { id: `prod-${tenantId}-1`, tenantId, name: `${prefix} CNC Precision Steel Flange`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-201`, category: 'Machined Parts', price: 185, costPrice: 78, stockQty: 220, minStockLevel: 40, status: 'in_stock', businessType: 'factory' },
      { id: `prod-${tenantId}-2`, tenantId, name: `${prefix} Heavy Duty Stamped Bracket`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-202`, category: 'Stampings', price: 64, costPrice: 22, stockQty: 540, minStockLevel: 80, status: 'in_stock', businessType: 'factory' },
      { id: `prod-${tenantId}-3`, tenantId, name: `${prefix} Bronze Bearing Assembly Kit`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-203`, category: 'Assemblies', price: 310, costPrice: 125, stockQty: 90, minStockLevel: 25, status: 'in_stock', businessType: 'factory' },
    ];
    bills = [
      { id: `bill-${tenantId}-1`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-1`, title: 'Three-Phase Plant Electricity & High-Voltage Grid', vendorOrClient: 'Edison Industrial Power', amount: 14500, dueDate, category: 'Utilities', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'factory' },
      { id: `bill-${tenantId}-2`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-2`, title: 'Raw Steel Sheet & Bar Stock Bulk Delivery', vendorOrClient: 'Arcelor Metal Distributors', amount: 32000, dueDate, category: 'Raw Materials', status: 'pending', paymentMethod: 'Corporate Wire', businessType: 'factory' },
      { id: `bill-${tenantId}-3`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-3`, title: 'CNC 5-Axis Laser Tooling Calibration', vendorOrClient: 'Kuka Robotics Service', amount: 4800, dueDate: pastDate, category: 'Maintenance', status: 'paid', paymentMethod: 'ACH Transfer', businessType: 'factory' },
    ];
    sales = [
      { id: `sale-${tenantId}-1`, tenantId, dealName: 'Tier-1 Automotive Flange Supply Batch', customerName: 'Continental Powertrain Inc.', amount: 94000, stage: 'closed_won', closeDate: pastDate, probability: 100, businessType: 'factory' },
      { id: `sale-${tenantId}-2`, tenantId, dealName: 'Agricultural Machinery Stamping Contract', customerName: 'Pioneer Tractor Works', amount: 62000, stage: 'negotiation', closeDate: dueDate, probability: 80, businessType: 'factory' },
      { id: `sale-${tenantId}-3`, tenantId, dealName: 'Bronze Bushing Assembly Annual Agreement', customerName: 'HydroMech Systems', amount: 48000, stage: 'proposal', closeDate: dueDate, probability: 50, businessType: 'factory' },
    ];
    customers = [
      { id: `cust-${tenantId}-1`, tenantId, name: 'Continental Powertrain Inc.', email: 'procurement@continental-pt.com', company: 'Continental Powertrain', phone: '+1 312-555-8822', status: 'active', lifetimeValue: 94000, businessType: 'factory' },
      { id: `cust-${tenantId}-2`, tenantId, name: 'Pioneer Tractor Works', email: 'supply@pioneertractor.com', company: 'Pioneer Tractor', phone: '+1 312-555-7733', status: 'active', lifetimeValue: 0, businessType: 'factory' },
    ];
    stock = [
      { id: `stk-${tenantId}-1`, tenantId, productName: `${prefix} CNC Precision Steel Flange`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-201`, warehouse: 'Finished Goods Bay 1', currentStock: 220, reservedStock: 40, minThreshold: 40, status: 'in_stock', businessType: 'factory' },
      { id: `stk-${tenantId}-2`, tenantId, productName: `${prefix} Heavy Duty Stamped Bracket`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-202`, warehouse: 'Plant Yard Bay 3', currentStock: 540, reservedStock: 60, minThreshold: 80, status: 'in_stock', businessType: 'factory' },
    ];
  } else if (v === 'industry') {
    products = [
      { id: `prod-${tenantId}-1`, tenantId, name: `${prefix} 33kV Vacuum Switchgear Module`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-301`, category: 'High Voltage', price: 18500, costPrice: 9400, stockQty: 18, minStockLevel: 5, status: 'in_stock', businessType: 'industry' },
      { id: `prod-${tenantId}-2`, tenantId, name: `${prefix} Armored XLPE Power Cable (100m)`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-302`, category: 'Cabling', price: 6200, costPrice: 2800, stockQty: 45, minStockLevel: 10, status: 'in_stock', businessType: 'industry' },
    ];
    bills = [
      { id: `bill-${tenantId}-1`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-1`, title: 'All-Terrain 200-Ton Crane Mobilization', vendorOrClient: 'Titan Heavy Rigging', amount: 38000, dueDate, category: 'Plant Equipment', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'industry' },
      { id: `bill-${tenantId}-2`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-2`, title: 'Grid Safety Certification & QA Inspection', vendorOrClient: 'National Electrical Bureau', amount: 16500, dueDate, category: 'Compliance', status: 'pending', paymentMethod: 'Corporate Wire', businessType: 'industry' },
    ];
    sales = [
      { id: `sale-${tenantId}-1`, tenantId, dealName: 'Regional Substation Expansion Project', customerName: 'National Power Transmission Authority', amount: 380000, stage: 'closed_won', closeDate: pastDate, probability: 100, businessType: 'industry' },
      { id: `sale-${tenantId}-2`, tenantId, dealName: 'Industrial Solar Farm Switchgear Tender', customerName: 'SunVolt Renewables', amount: 215000, stage: 'negotiation', closeDate: dueDate, probability: 75, businessType: 'industry' },
    ];
    customers = [
      { id: `cust-${tenantId}-1`, tenantId, name: 'National Power Transmission Authority', email: 'epc@nationalpower.gov', company: 'National Power', phone: '+44 20 7946 0912', status: 'active', lifetimeValue: 380000, businessType: 'industry' },
      { id: `cust-${tenantId}-2`, tenantId, name: 'SunVolt Renewables Group', email: 'projects@sunvolt.com', company: 'SunVolt Renewables', phone: '+44 20 7946 0933', status: 'active', lifetimeValue: 0, businessType: 'industry' },
    ];
    stock = [
      { id: `stk-${tenantId}-1`, tenantId, productName: `${prefix} 33kV Vacuum Switchgear Module`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-301`, warehouse: 'Central Depot Berth 4', currentStock: 18, reservedStock: 4, minThreshold: 5, status: 'in_stock', businessType: 'industry' },
    ];
  } else if (v === 'ecommerce') {
    products = [
      { id: `prod-${tenantId}-1`, tenantId, name: `${prefix} Waterproof Technical Backpack (30L)`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-401`, category: 'Packs & Bags', price: 129, costPrice: 38, stockQty: 260, minStockLevel: 40, status: 'in_stock', businessType: 'ecommerce' },
      { id: `prod-${tenantId}-2`, tenantId, name: `${prefix} Seamless Performance Thermal Tee`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-402`, category: 'Apparel', price: 78, costPrice: 21, stockQty: 420, minStockLevel: 60, status: 'in_stock', businessType: 'ecommerce' },
      { id: `prod-${tenantId}-3`, tenantId, name: `${prefix} Lightweight Carbon Trekking Poles`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-403`, category: 'Accessories', price: 89, costPrice: 26, stockQty: 110, minStockLevel: 25, status: 'in_stock', businessType: 'ecommerce' },
    ];
    bills = [
      { id: `bill-${tenantId}-1`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-1`, title: 'East Coast 3PL Fulfillment & Warehousing', vendorOrClient: 'ShipStream Logistics Network', amount: 7400, dueDate, category: 'Fulfillment', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'ecommerce' },
      { id: `bill-${tenantId}-2`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-2`, title: 'Google & Meta Paid Growth Acquisition', vendorOrClient: 'Performance Digital Media', amount: 16800, dueDate, category: 'Advertising', status: 'pending', paymentMethod: 'Credit Card', businessType: 'ecommerce' },
    ];
    sales = [
      { id: `sale-${tenantId}-1`, tenantId, dealName: 'D2C Autumn Launch Flash Sales Campaign', customerName: 'Online Direct Shoppers (Shopify)', amount: 76000, stage: 'closed_won', closeDate: pastDate, probability: 100, businessType: 'ecommerce' },
      { id: `sale-${tenantId}-2`, tenantId, dealName: 'Holiday Boutique Wholesale Consignment', customerName: 'Summit Outfitters Retail Chain', amount: 34000, stage: 'negotiation', closeDate: dueDate, probability: 85, businessType: 'ecommerce' },
    ];
    customers = [
      { id: `cust-${tenantId}-1`, tenantId, name: 'Summit Outfitters Retail Chain', email: 'wholesale@summitoutfitters.com', company: 'Summit Outfitters', phone: '+1 212-555-9011', status: 'active', lifetimeValue: 34000, businessType: 'ecommerce' },
      { id: `cust-${tenantId}-2`, tenantId, name: 'Taylor Reed (Direct D2C)', email: 'taylor.r@gmail.com', company: 'Shopper', phone: '+1 212-555-8844', status: 'active', lifetimeValue: 380, businessType: 'ecommerce' },
    ];
    stock = [
      { id: `stk-${tenantId}-1`, tenantId, productName: `${prefix} Waterproof Technical Backpack (30L)`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-401`, warehouse: '3PL Fulfillment Depot', currentStock: 260, reservedStock: 35, minThreshold: 40, status: 'in_stock', businessType: 'ecommerce' },
    ];
  } else {
    // Default: software
    products = [
      { id: `prod-${tenantId}-1`, tenantId, name: `${prefix} Enterprise Platform License (Annual)`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-501`, category: 'Software License', price: 14000, costPrice: 1400, stockQty: 100, minStockLevel: 10, status: 'in_stock', businessType: 'software' },
      { id: `prod-${tenantId}-2`, tenantId, name: `${prefix} Professional Cloud Seat (Monthly)`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-502`, category: 'SaaS Seat', price: 99, costPrice: 12, stockQty: 500, minStockLevel: 50, status: 'in_stock', businessType: 'software' },
      { id: `prod-${tenantId}-3`, tenantId, name: `${prefix} Dedicated API & Webhook Cluster`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-503`, category: 'API Addon', price: 3500, costPrice: 450, stockQty: 50, minStockLevel: 5, status: 'in_stock', businessType: 'software' },
    ];
    bills = [
      { id: `bill-${tenantId}-1`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-1`, title: 'AWS Cloud Compute & Multi-Region DB Cluster', vendorOrClient: 'Amazon Web Services Inc.', amount: 8900, dueDate, category: 'Cloud Infrastructure', status: 'paid', paymentMethod: 'Corporate Wire', businessType: 'software' },
      { id: `bill-${tenantId}-2`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-2`, title: 'SOC-2 Type II Annual Information Security Audit', vendorOrClient: 'GuardianSec Assurance', amount: 7200, dueDate, category: 'Security & Compliance', status: 'pending', paymentMethod: 'ACH Transfer', businessType: 'software' },
      { id: `bill-${tenantId}-3`, tenantId, invoiceNumber: `INV-${Date.now().toString().slice(-4)}-3`, title: 'GitHub Enterprise & CI/CD Pipelines', vendorOrClient: 'GitHub Inc.', amount: 1400, dueDate: pastDate, category: 'Developer Tools', status: 'paid', paymentMethod: 'Credit Card', businessType: 'software' },
    ];
    sales = [
      { id: `sale-${tenantId}-1`, tenantId, dealName: 'Enterprise 100-Seat License Deployment', customerName: 'Fintech Innovations Group', amount: 68000, stage: 'closed_won', closeDate: pastDate, probability: 100, businessType: 'software' },
      { id: `sale-${tenantId}-2`, tenantId, dealName: 'Global SaaS Multi-Region API Rollout', customerName: 'Meridian Health Cloud', amount: 42000, stage: 'negotiation', closeDate: dueDate, probability: 75, businessType: 'software' },
      { id: `sale-${tenantId}-3`, tenantId, dealName: 'Developer API Integration Pilot', customerName: 'Beacon Analytics LLC', amount: 18500, stage: 'qualified', closeDate: dueDate, probability: 60, businessType: 'software' },
    ];
    customers = [
      { id: `cust-${tenantId}-1`, tenantId, name: 'Fintech Innovations Group', email: 'it-contracts@fintechinno.com', company: 'Fintech Innovations', phone: '+1 415-555-7890', status: 'active', lifetimeValue: 68000, businessType: 'software' },
      { id: `cust-${tenantId}-2`, tenantId, name: 'Meridian Health Cloud', email: 'cloud@meridianhealth.org', company: 'Meridian Health', phone: '+1 415-555-6677', status: 'active', lifetimeValue: 0, businessType: 'software' },
    ];
    stock = [
      { id: `stk-${tenantId}-1`, tenantId, productName: `${prefix} Enterprise Platform License (Annual)`, sku: `SKU-${prefix.slice(0, 3).toUpperCase()}-501`, warehouse: 'Digital Cloud Licensing Vault', currentStock: 100, reservedStock: 12, minThreshold: 10, status: 'in_stock', businessType: 'software' },
    ];
  }

  bills = bills.map((b) => ({
    ...b,
    vendor: b.vendorOrClient,
    vendorName: b.vendorOrClient,
  }));

  return { products, bills, sales, customers, stock };
};

/**
 * Creates a brand-new Tenant with guaranteed dedicated, isolated starter data
 */
export const provisionNewTenantWithData = async ({
  name,
  slug: rawSlug,
  vertical = 'software',
  planTier = 'starter',
  email = '',
  selectedVerticals = null,
}) => {
  const cleanName = name || 'New Organization';
  const slug = (rawSlug || cleanName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const tenantId = `tenant-${slug}-${Date.now().toString(36).slice(-4)}`;
  const planConfig = PLAN_TIER_CONFIG[planTier] || PLAN_TIER_CONFIG.starter;

  const maxBusinesses = planTier === 'enterprise' ? 99 : planTier === 'growth' ? 3 : 1;
  const allowedVerticals = Array.isArray(selectedVerticals) && selectedVerticals.length > 0
    ? selectedVerticals
    : planTier === 'enterprise'
    ? ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce']
    : planTier === 'growth'
    ? [vertical, 'ecommerce', 'factory']
    : [vertical];

  const tenantRecord = {
    _id: tenantId,
    id: tenantId,
    name: cleanName,
    slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
    vertical,
    status: 'active',
    planTier,
    currency: 'USD',
    timezone: 'UTC',
    limits: {
      ...planConfig.limits,
      maxBusinesses,
    },
    allowedVerticals,
    settings: {
      enabledModules: planConfig.enabledModules,
    },
  };

  // 1. Newly created accounts start completely clean with 0 records
  const products = [];
  const bills = [];
  const sales = [];
  const customers = [];
  const stock = [];

  // 2. Persist in MongoDB if online
  if (getDbStatus().connected) {
    try {
      await Tenant.create(tenantRecord);
      await initializeChartOfAccounts(tenantId);
    } catch (err) {
      console.warn(`[Provisioning Mongo Warning]: ${err.message}`);
    }
  }

  // 3. Persist in in-memory fallback stores
  addInMemoryTenant(tenantRecord);
  await initializeChartOfAccounts(tenantId).catch(() => {});

  // 4. Invalidate and initialize empty Redis cache for this tenant
  try {
    await redisService.del('crm:system:tenants');
    await redisService.delByPattern(`crm:${tenantId}:*`);
    await redisService.set(`crm:${tenantId}:products:all`, [], 'EX', 3600);
    await redisService.set(`crm:${tenantId}:bills:all`, [], 'EX', 3600);
    await redisService.set(`crm:${tenantId}:sales:all`, [], 'EX', 3600);
    await redisService.set(`crm:${tenantId}:customers:all`, [], 'EX', 3600);
    await redisService.set(`crm:${tenantId}:stock:all`, [], 'EX', 3600);
  } catch (err) {
    console.warn(`[Provisioning Redis Warning]: ${err.message}`);
  }

  return {
    tenant: tenantRecord,
    starterCounts: {
      products: 0,
      bills: 0,
      sales: 0,
      customers: 0,
      stock: 0,
    },
  };
};
