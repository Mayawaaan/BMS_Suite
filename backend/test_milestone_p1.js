import {
  getSystemTenants,
  updateTenantStatus,
  updateTenantPlan,
} from './controllers/systemController.js';
import { resolveTenant } from './middleware/tenantMiddleware.js';
import { enforceQuota } from './middleware/subscriptionGuard.js';
import { setInMemoryProducts } from './controllers/productController.js';

async function testMilestoneP1() {
  console.log('🧪 =========================================================');
  console.log('🧪 MILESTONE P1: SUPER ADMIN GOVERNANCE & SUBSCRIPTION LOCKS');
  console.log('🧪 =========================================================\n');

  // 1. Query Tenant Directory & Quota Telemetry
  console.log('▶ [1/3] Testing Super Admin Tenant Directory & Quota Telemetry...');
  let dirRes = null;
  await getSystemTenants(
    { tenantId: 'tenant-universal', user: { role: 'superadmin' } },
    { status: () => ({ json: (d) => { dirRes = d; } }), json: (d) => { dirRes = d; } }
  );

  console.log(`✔ Retrieved ${dirRes.count} Tenants with live usage quotas.`);
  for (const t of dirRes.data.slice(0, 3)) {
    console.log(`  - [${t.slug}] ${t.name} | Plan: ${t.planTier.toUpperCase()} | Status: ${t.status.toUpperCase()} | SKUs: ${t.usage.skusCount}/${t.limits.maxSkus} (${t.usage.skuQuotaPercent}%)`);
  }

  // 2. Subscription Account Lockout Enforcement
  console.log('\n▶ [2/3] Testing Account Lockout Enforcement on Delinquent Tenants...');

  // Lock tenant-ecommerce
  let lockRes = null;
  await updateTenantStatus(
    { params: { id: 'tenant-ecommerce' }, body: { status: 'locked', reason: 'Delinquent Payment Notice' } },
    { status: () => ({ json: (d) => { lockRes = d; } }), json: (d) => { lockRes = d; } }
  );
  console.log(`✔ ${lockRes.message}`);

  // Test tenant resolution guard on locked tenant (for regular user)
  let guardStatus = null;
  let guardResponse = null;
  let nextCalled = false;

  await resolveTenant(
    {
      headers: { 'x-tenant-id': 'tenant-ecommerce' },
      query: {},
      user: { role: 'admin', userId: 'user-008' }, // Not superadmin
    },
    {
      status: (code) => {
        guardStatus = code;
        return {
          json: (data) => {
            guardResponse = data;
          },
        };
      },
    },
    () => {
      nextCalled = true;
    }
  );

  if (guardStatus === 423 && guardResponse.code === 'TENANT_ACCOUNT_LOCKED') {
    console.log(`✔ SUCCESS: Non-superadmin blocked with 423 Locked: ${guardResponse.message}`);
  } else {
    throw new Error(`Expected 423 Locked but received: ${guardStatus}`);
  }

  // Unlock tenant back to active
  await updateTenantStatus(
    { params: { id: 'tenant-ecommerce' }, body: { status: 'active', reason: 'Payment Restored' } },
    { status: () => ({ json: () => {} }), json: () => {} }
  );
  console.log('✔ Tenant account successfully unlocked back to ACTIVE.');

  // 3. Plan Tier Upgrade & Quota Gating
  console.log('\n▶ [3/3] Testing Plan Quota Gating (Free Tier max 50 SKUs vs. Growth Tier)...');

  // Set tenant-ecommerce to free tier (maxSkus: 50)
  await updateTenantPlan(
    { params: { id: 'tenant-ecommerce' }, body: { planTier: 'free' } },
    { status: () => ({ json: () => {} }), json: () => {} }
  );

  // Seed 50 products in tenant-ecommerce
  const dummyProducts = Array.from({ length: 50 }, (_, i) => ({
    id: `prod-dummy-${i}`,
    tenantId: 'tenant-ecommerce',
    name: `Dummy SKU ${i}`,
    sku: `SKU-DUMMY-${i}`,
    price: 10,
    costPrice: 5,
  }));
  setInMemoryProducts(dummyProducts);

  // Test quota middleware
  let quotaStatus = null;
  let quotaResponse = null;
  let quotaPassed = false;

  const skuQuotaGuard = enforceQuota('skus');
  await skuQuotaGuard(
    {
      tenantId: 'tenant-ecommerce',
      tenant: { planTier: 'free', limits: { maxSkus: 50 } },
      user: { role: 'admin' },
    },
    {
      status: (code) => {
        quotaStatus = code;
        return {
          json: (data) => {
            quotaResponse = data;
          },
        };
      },
    },
    () => {
      quotaPassed = true;
    }
  );

  if (quotaStatus === 403 && quotaResponse.code === 'QUOTA_EXCEEDED_SKUS') {
    console.log(`✔ SUCCESS: SKU Creation blocked by quota guard: ${quotaResponse.message}`);
  } else {
    throw new Error(`Expected 403 Quota Exceeded but received: ${quotaStatus}`);
  }

  // Upgrade tenant to Growth Tier (max 5,000 SKUs)
  await updateTenantPlan(
    { params: { id: 'tenant-ecommerce' }, body: { planTier: 'growth' } },
    { status: () => ({ json: () => {} }), json: () => {} }
  );

  // Re-check quota with growth tier limits
  let growthPassed = false;
  await skuQuotaGuard(
    {
      tenantId: 'tenant-ecommerce',
      tenant: { planTier: 'growth', limits: { maxSkus: 5000 } },
      user: { role: 'admin' },
    },
    { status: () => ({ json: () => {} }) },
    () => {
      growthPassed = true;
    }
  );

  if (growthPassed) {
    console.log('✔ SUCCESS: Quota guard unlocked after subscription upgrade to Growth Tier (50 / 5,000 SKUs).');
  } else {
    throw new Error('Growth tier quota check failed!');
  }

  console.log('\n=========================================================');
  console.log('🎉 ALL MILESTONE P1 TESTS PASSED WITH 100% SUCCESS!');
  console.log('=========================================================\n');
  process.exit(0);
}

testMilestoneP1().catch((err) => {
  console.error('❌ Milestone P1 Test Failed:', err);
  process.exit(1);
});
