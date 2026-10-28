import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function testPortfolioAndVerticals() {
  console.log('=== TESTING MULTI-BUSINESS & VERTICAL SELECTION API ===\n');

  // Test 1: Register with Growth tier and 3 selected verticals
  const uniqueEmail = `growth_founder_${Date.now()}@example.com`;
  console.log('[1] Testing registration with Growth Pack and 3 verticals...');
  const regPayload = {
    name: 'Growth Entrepreneur',
    email: uniqueEmail,
    password: 'password123',
    companyName: 'Apex Growth Conglomerate',
    companyType: 'shop', // Primary
    planTier: 'growth',
    selectedVerticals: ['shop', 'ecommerce', 'software'],
  };

  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload),
  });

  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 201, `Expected 201 Created, got ${regRes.status}: ${JSON.stringify(regData)}`);
  assert(regData.user, 'Expected user object');
  assert.strictEqual(regData.user.planTier, 'growth', 'Plan tier should be growth');
  assert.strictEqual(regData.user.maxBusinesses, 3, 'maxBusinesses should be 3');
  assert.deepStrictEqual(regData.user.allowedVerticals, ['shop', 'ecommerce', 'software'], 'allowedVerticals should have 3 chosen verticals');
  console.log('  ✓ PASS: Account created with Growth Pack (3 verticals allowed: shop, ecommerce, software)\n');

  // Test 2: Update portfolio verticals within 3 limit
  console.log('[2] Testing portfolio vertical updates within quota (switch software to factory)...');
  const updateRes = await fetch(`${BASE_URL}/auth/portfolio/verticals`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${regData.token}`,
    },
    body: JSON.stringify({
      tenantId: regData.user.tenantId,
      verticals: ['shop', 'ecommerce', 'factory'],
    }),
  });

  const updateData = await updateRes.json();
  assert.strictEqual(updateRes.status, 200, `Expected 200 OK, got ${updateRes.status}`);
  assert.deepStrictEqual(updateData.allowedVerticals, ['shop', 'ecommerce', 'factory'], 'Updated allowedVerticals matches');
  console.log('  ✓ PASS: Successfully updated portfolio verticals to: shop, ecommerce, factory\n');

  // Test 3: Attempt exceeding quota (4 verticals on growth pack)
  console.log('[3] Testing quota enforcement: attempt selecting 4 verticals on Growth Pack...');
  const overQuotaRes = await fetch(`${BASE_URL}/auth/portfolio/verticals`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${regData.token}`,
    },
    body: JSON.stringify({
      tenantId: regData.user.tenantId,
      verticals: ['shop', 'ecommerce', 'factory', 'industry'],
    }),
  });

  const overQuotaData = await overQuotaRes.json();
  assert.strictEqual(overQuotaRes.status, 400, `Expected 400 Bad Request for exceeding quota, got ${overQuotaRes.status}`);
  console.log('  ✓ PASS: Quota enforcement blocked 4 verticals on Growth Pack with 400 Bad Request\n');

  // Test 4: Verify Starter pack registration defaults to 1 vertical
  console.log('[4] Testing Starter pack defaults to 1 primary vertical...');
  const starterEmail = `starter_founder_${Date.now()}@example.com`;
  const starterRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Solo Proprietor',
      email: starterEmail,
      password: 'password123',
      companyName: 'Boutique Factory',
      companyType: 'factory',
      planTier: 'starter',
    }),
  });

  const starterData = await starterRes.json();
  assert.strictEqual(starterRes.status, 201, `Expected 201 Created, got ${starterRes.status}`);
  assert.strictEqual(starterData.user.maxBusinesses, 1, 'Starter maxBusinesses must be 1');
  assert.deepStrictEqual(starterData.user.allowedVerticals, ['factory'], 'Starter allowedVerticals must only contain factory');
  console.log('  ✓ PASS: Starter account restricted to 1 vertical (factory)\n');

  // Test 5: All-Business Financial Analytics (Profitable vs Loss-Making classification)
  console.log('[5] Testing All-Business Financial Analytics (/revenue/portfolio-analytics)...');
  const analyticsRes = await fetch(`${BASE_URL}/revenue/portfolio-analytics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${regData.token}`,
      'x-tenant-id': regData.user.tenantId,
    },
  });

  const analyticsJson = await analyticsRes.json();
  assert.strictEqual(analyticsRes.status, 200, `Expected 200 OK, got ${analyticsRes.status}`);
  assert(analyticsJson.data, 'Expected data object in analytics response');
  assert(Array.isArray(analyticsJson.data.entities), 'Expected entities array in portfolio analytics');
  assert.strictEqual(analyticsJson.data.entities.length, 5, 'Expected 5 standard business vertical entities');
  
  // Verify classification fields
  const sampleEntity = analyticsJson.data.entities[0];
  assert('revenue' in sampleEntity, 'Entity must contain revenue');
  assert('expenses' in sampleEntity, 'Entity must contain expenses');
  assert('netProfit' in sampleEntity, 'Entity must contain netProfit');
  assert('profitMargin' in sampleEntity, 'Entity must contain profitMargin');
  assert(['PROFITABLE', 'LOSS_MAKING', 'BREAK_EVEN', 'CLEAN_SLATE'].includes(sampleEntity.status), 'Valid financial status');
  console.log(`  ✓ PASS: Analytics returned 5 vertical entities with P&L classification (Status: ${sampleEntity.status}, Net Margin: ${sampleEntity.profitMargin}%)\n`);

  // Test 6: Niche Change Data Purging (/auth/portfolio/purge-vertical)
  console.log('[6] Testing Niche Change Data Purging (/auth/portfolio/purge-vertical)...');
  
  // First, add a dummy bill for 'factory' vertical
  const billRes = await fetch(`${BASE_URL}/bills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${regData.token}`,
      'x-tenant-id': regData.user.tenantId,
    },
    body: JSON.stringify({
      title: 'Factory Stamping Rig Maintenance',
      amount: 4500,
      dueDate: '2026-11-20',
      vendorOrClient: 'Machinery Works LLC',
      category: 'Maintenance',
      businessType: 'factory',
      status: 'pending',
    }),
  });
  assert.strictEqual(billRes.status, 201, 'Bill should be created');

  // Verify bill exists for factory
  const getFactoryBillsRes = await fetch(`${BASE_URL}/bills?businessType=factory`, {
    headers: {
      Authorization: `Bearer ${regData.token}`,
      'x-tenant-id': regData.user.tenantId,
    },
  });
  const factoryBillsJson = await getFactoryBillsRes.json();
  assert(factoryBillsJson.count >= 1, 'Factory should have at least 1 bill before purge');

  // Now execute niche purge: decommission 'factory' and replace with 'industry'
  const purgeRes = await fetch(`${BASE_URL}/auth/portfolio/purge-vertical`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${regData.token}`,
    },
    body: JSON.stringify({
      tenantId: regData.user.tenantId,
      vertical: 'factory',
      replacementVertical: 'industry',
    }),
  });

  const purgeJson = await purgeRes.json();
  assert.strictEqual(purgeRes.status, 200, `Expected 200 OK from purge, got ${purgeRes.status}`);
  assert.strictEqual(purgeJson.purgedVertical, 'factory', 'Purged vertical must be factory');
  assert.strictEqual(purgeJson.replacementVertical, 'industry', 'Replacement vertical must be industry');
  assert(purgeJson.allowedVerticals.includes('industry'), 'Allowed verticals must include new niche');
  assert(!purgeJson.allowedVerticals.includes('factory'), 'Allowed verticals must no longer include purged niche');

  // Verify that factory bills were purged to 0
  const postPurgeBillsRes = await fetch(`${BASE_URL}/bills?businessType=factory`, {
    headers: {
      Authorization: `Bearer ${regData.token}`,
      'x-tenant-id': regData.user.tenantId,
    },
  });
  const postPurgeJson = await postPurgeBillsRes.json();
  assert.strictEqual(postPurgeJson.count, 0, 'Factory bills must be purged to 0');
  console.log('  ✓ PASS: Decommissioned niche "factory" data wiped to 0; slot replaced with "industry"\n');

  console.log('========================================');
  console.log('ALL MULTI-BUSINESS & VERTICAL TESTS PASSED! (6/6)');
  console.log('========================================');
}

testPortfolioAndVerticals().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
