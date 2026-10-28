import assert from 'assert';

async function testDashboardVelocity() {
  console.log('--- TESTING EXECUTIVE PULSE DASHBOARD VELOCITY API ---');
  const res = await fetch('http://localhost:5000/api/dashboard');
  assert.strictEqual(res.status, 200, 'Expected 200 OK');
  const json = await res.json();
  
  assert.strictEqual(json.success, true, 'Expected success: true');
  assert(json.data, 'Expected data object');
  assert(json.data.velocitySeries, 'Expected velocitySeries object');
  
  const vs = json.data.velocitySeries;
  console.log('velocitySeries:', JSON.stringify(vs, null, 2));
  
  assert(Array.isArray(vs.labels), 'Expected labels array');
  assert.strictEqual(vs.labels.length, 6, 'Expected 6 monthly labels');
  assert(Array.isArray(vs.data), 'Expected data array');
  assert.strictEqual(vs.data.length, 6, 'Expected 6 monthly data points');
  assert.strictEqual(typeof vs.netOperatingMargin, 'number', 'Expected numeric margin');
  assert.strictEqual(typeof vs.currentVelocity, 'number', 'Expected numeric velocity');
  assert.strictEqual(vs.unit, 'INR', 'Expected INR unit');
  
  console.log('✓ PASS: All Executive Pulse velocity series assertions passed successfully!');
}

testDashboardVelocity().catch((err) => {
  console.error('✗ FAIL:', err.message);
  process.exit(1);
});
