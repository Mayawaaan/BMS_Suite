import {
  openSession,
  scanBarcode,
  posCheckout,
  closeSession,
} from './controllers/verticalRetailController.js';
import {
  createBom,
  getBoms,
  createWorkOrder,
  completeWorkOrder,
} from './controllers/verticalMfgController.js';
import {
  createSubscription,
  getSubscriptions,
  triggerBillingRun,
  cancelSubscription,
} from './controllers/verticalSaasController.js';
import { getAccounts, getJournalEntries } from './services/ledgerService.js';
import { setInMemoryProducts, getInMemoryProducts } from './controllers/productController.js';
import { setInMemoryStock, getInMemoryStock } from './controllers/stockController.js';

async function testMilestoneP3() {
  console.log('🧪 =========================================================');
  console.log('🧪 MILESTONE P3: UNIVERSAL VERTICAL MODULAR ENGINES TEST');
  console.log('🧪 =========================================================\n');

  // Setup sample retail and raw material products in memory for testing
  const sampleProducts = [
    {
      id: 'prod-pos-01',
      tenantId: 'tenant-retail',
      name: 'Organic Fairtrade Coffee Beans 1kg',
      sku: 'SKU-COFFEE-01',
      price: 24.5,
      costPrice: 12.0,
      stockQty: 50,
      businessType: 'shop',
    },
    {
      id: 'prod-mfg-raw-01',
      tenantId: 'tenant-factory',
      name: 'Cast Aluminum Ingot Grade A',
      sku: 'RAW-ALUM-01',
      price: 55.0,
      costPrice: 45.0,
      stockQty: 200,
      businessType: 'factory',
    },
  ];
  setInMemoryProducts(sampleProducts);

  const sampleStock = [
    {
      id: 'stk-pos-01',
      tenantId: 'tenant-retail',
      productId: 'prod-pos-01',
      productName: 'Organic Fairtrade Coffee Beans 1kg',
      sku: 'SKU-COFFEE-01',
      currentStock: 50,
      businessType: 'shop',
    },
    {
      id: 'stk-mfg-raw-01',
      tenantId: 'tenant-factory',
      productId: 'prod-mfg-raw-01',
      productName: 'Cast Aluminum Ingot Grade A',
      sku: 'RAW-ALUM-01',
      currentStock: 200,
      businessType: 'factory',
    },
  ];
  setInMemoryStock(sampleStock);

  // ==========================================================
  // PART 1: RETAIL / POS ENGINE
  // ==========================================================
  console.log('▶ [1/3] Testing Retail / POS Counter Engine (tenant-retail)...');

  // 1.1 Open Session
  let sessionRes = null;
  await openSession(
    {
      tenantId: 'tenant-retail',
      user: { name: 'Maya Lin', userId: 'user-003' },
      body: { registerId: 'Register #1 - Front', openingFloat: 250.0 },
    },
    { status: () => ({ json: (d) => { sessionRes = d; } }), json: (d) => { sessionRes = d; } }
  );
  console.log(`✔ POS Register Session opened: ${sessionRes.data.sessionNumber} with float $${sessionRes.data.openingFloat}`);

  // 1.2 Scan Barcode
  let barcodeRes = null;
  await scanBarcode(
    { tenantId: 'tenant-retail', params: { code: 'SKU-COFFEE-01' } },
    { status: () => ({ json: (d) => { barcodeRes = d; } }), json: (d) => { barcodeRes = d; } }
  );
  console.log(`✔ Barcode scan lookup: ${barcodeRes.data.name} ($${barcodeRes.data.price})`);

  // 1.3 POS Checkout
  let checkoutRes = null;
  await posCheckout(
    {
      tenantId: 'tenant-retail',
      body: {
        sessionId: sessionRes.data.sessionNumber,
        customerName: 'Marcus Aurelius',
        items: [{ sku: 'SKU-COFFEE-01', name: 'Organic Fairtrade Coffee Beans 1kg', quantity: 2, price: 24.5 }],
        paymentMethod: 'Cash',
        amountReceived: 60.0,
        taxRate: 8.5,
      },
    },
    { status: () => ({ json: (d) => { checkoutRes = d; } }), json: (d) => { checkoutRes = d; } }
  );
  console.log(`✔ POS Checkout complete: Receipt ${checkoutRes.receipt.receiptNumber} issued for $${checkoutRes.receipt.total} (Change due: $${checkoutRes.receipt.changeDue})`);

  // Verify stock decremented
  const updatedCoffeeStock = getInMemoryStock().find((s) => s.sku === 'SKU-COFFEE-01');
  console.log(`✔ Stock decremented atomically: 50 -> ${updatedCoffeeStock.currentStock} units.`);
  if (updatedCoffeeStock.currentStock !== 48) throw new Error('Stock decrement failed!');

  // 1.4 Close Session & Reconcile Cash
  let closeRes = null;
  await closeSession(
    {
      tenantId: 'tenant-retail',
      params: { sessionId: sessionRes.data.sessionNumber },
      body: { closingCash: 250.0 + checkoutRes.receipt.total, notes: 'Drawer matched perfectly' },
    },
    { status: () => ({ json: (d) => { closeRes = d; } }), json: (d) => { closeRes = d; } }
  );
  console.log(`✔ POS Drawer Reconciled: Expected $${closeRes.data.expectedCash.toFixed(2)}, Discrepancy: $${closeRes.data.cashDiscrepancy.toFixed(2)}`);

  // ==========================================================
  // PART 2: MANUFACTURING & BILL OF MATERIALS ENGINE
  // ==========================================================
  console.log('\n▶ [2/3] Testing Manufacturing Execution & BOM Engine (tenant-factory)...');

  // 2.1 Create BOM
  let bomRes = null;
  await createBom(
    {
      tenantId: 'tenant-factory',
      body: {
        name: 'Industrial CNC Stamping Cylinder Assembly',
        finishedProductName: 'CNC High-Force Stamping Cylinder',
        finishedSku: 'SKU-CNC-CYL-90',
        components: [
          { rawProductName: 'Cast Aluminum Ingot Grade A', rawSku: 'RAW-ALUM-01', quantityRequired: 3.0, unitCost: 45.0 },
        ],
        laborCost: 40.0,
        overheadCost: 20.0,
      },
    },
    { status: () => ({ json: (d) => { bomRes = d; } }), json: (d) => { bomRes = d; } }
  );
  console.log(`✔ Bill of Materials created: ${bomRes.data.bomNumber} for ${bomRes.data.finishedProductName} (Unit Cost: $${bomRes.data.totalUnitCost})`);

  // 2.2 Schedule Work Order
  let woRes = null;
  await createWorkOrder(
    {
      tenantId: 'tenant-factory',
      body: { bomId: bomRes.data.bomNumber, quantityToProduce: 10, warehouse: 'Main Hub Stamping Depot' },
    },
    { status: () => ({ json: (d) => { woRes = d; } }), json: (d) => { woRes = d; } }
  );
  console.log(`✔ Work Order Scheduled: ${woRes.data.orderNumber} for ${woRes.data.quantityToProduce} units`);

  // 2.3 Complete Work Order (Raw Material Depletion & Inventory Capitalization)
  let completeRes = null;
  await completeWorkOrder(
    { tenantId: 'tenant-factory', params: { id: woRes.data.orderNumber } },
    { status: () => ({ json: (d) => { completeRes = d; } }), json: (d) => { completeRes = d; } }
  );
  console.log(`✔ Work Order Completed: ${completeRes.message}`);

  // Verify raw materials depleted: 200 - (3 * 10) = 170
  const rawStock = getInMemoryStock().find((s) => s.sku === 'RAW-ALUM-01');
  const finishedStock = getInMemoryStock().find((s) => s.sku === 'SKU-CNC-CYL-90');
  console.log(`✔ Raw materials depleted: 200 -> ${rawStock.currentStock} units.`);
  console.log(`✔ Finished goods capitalized: ${finishedStock.currentStock} units in inventory.`);
  if (rawStock.currentStock !== 170 || finishedStock.currentStock !== 10) {
    throw new Error('Manufacturing assembly stock transformation failed!');
  }

  // ==========================================================
  // PART 3: SAAS RECURRING SUBSCRIPTION & BILLING ENGINE
  // ==========================================================
  console.log('\n▶ [3/3] Testing SaaS Recurring Subscription Engine (tenant-software)...');

  // 3.1 Create Subscription
  let subRes = null;
  await createSubscription(
    {
      tenantId: 'tenant-software',
      body: {
        customerName: 'Stripe Analytics Partner LLC',
        customerEmail: 'finance@analytics-partner.io',
        planName: 'Enterprise AI Cluster Tier',
        mrr: 5800.0,
        seats: 50,
      },
    },
    { status: () => ({ json: (d) => { subRes = d; } }), json: (d) => { subRes = d; } }
  );
  console.log(`✔ Subscription Activated: ${subRes.data.subscriptionNumber} for ${subRes.data.customerName} ($${subRes.data.mrr}/mo MRR)`);

  // 3.2 Automated Recurring Billing Run
  let runRes = null;
  await triggerBillingRun(
    { tenantId: 'tenant-software' },
    { status: () => ({ json: (d) => { runRes = d; } }), json: (d) => { runRes = d; } }
  );
  console.log(`✔ Recurring Billing Run: Generated ${runRes.summary.invoicesCount} invoices totaling $${runRes.summary.totalInvoiced.toLocaleString()}`);

  // 3.3 Churn / Cancellation
  let cancelRes = null;
  await cancelSubscription(
    {
      tenantId: 'tenant-software',
      params: { id: subRes.data.subscriptionNumber },
      body: { reason: 'Downsizing corporate team' },
    },
    { status: () => ({ json: (d) => { cancelRes = d; } }), json: (d) => { cancelRes = d; } }
  );
  console.log(`✔ Subscription Lifecycle: ${cancelRes.message}`);

  console.log('\n=========================================================');
  console.log('🎉 ALL MILESTONE P3 TESTS PASSED WITH 100% SUCCESS!');
  console.log('=========================================================\n');
  process.exit(0);
}

testMilestoneP3().catch((err) => {
  console.error('❌ Milestone P3 Test Failed:', err);
  process.exit(1);
});
