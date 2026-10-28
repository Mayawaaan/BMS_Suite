const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING EMPLOYEE MANAGEMENT & WORKFORCE GOVERNANCE VERIFICATION ===\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  // 1. Authenticate as Retail Shop Admin
  console.log('[1] Logging in as Retail Shop Admin (admin@retailshop.io)...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io', password: 'password123' }),
  });
  const loginData = await loginRes.json();
  assert(loginData.success && loginData.token, 'Retail Shop Admin authenticated successfully');

  const adminToken = loginData.token;
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
    'X-Tenant-ID': 'tenant-retail',
  };

  // 2. Fetch Employees for Retail Shop
  console.log('\n[2] Fetching employees for Retail Shop (tenant-retail)...');
  const empRes = await fetch(`${BASE_URL}/tenants/employees`, {
    headers: adminHeaders,
  });
  const empData = await empRes.json();
  assert(empRes.status === 200, `GET /api/tenants/employees returned status 200 (Got: ${empRes.status})`);
  assert(empData.success === true, 'Response marked success');
  assert(Array.isArray(empData.data), 'Returns data array');
  assert(empData.tenantId === 'tenant-retail', `Scoped to tenant-retail (Got: ${empData.tenantId})`);

  // Verify tenant isolation: no superadmin
  const hasSuperAdmin = empData.data.some((e) => e.email === 'superadmin@zsyio.io' || e.role === 'superadmin');
  assert(!hasSuperAdmin, 'Tenant isolation intact: Super Admin is NOT exposed in Retail Shop employee list');

  const hasShopAdmin = empData.data.some((e) => e.email === 'admin@retailshop.io');
  const hasShopStaff = empData.data.some((e) => e.email === 'staff@retailshop.io');
  const hasShopAuditor = empData.data.some((e) => e.email === 'auditor@retailshop.io');
  assert(hasShopAdmin && hasShopStaff && hasShopAuditor, 'Found Retail Shop Admin, Staff, and Auditor in workforce');

  console.log(`      Current Employees: ${empData.data.map(e => `${e.name} (${e.role})`).join(', ')}`);
  console.log(`      Metrics: Total: ${empData.metrics.total}, Staff: ${empData.metrics.staffCount}, Auditor: ${empData.metrics.auditorCount}`);

  // 3. Create a New Employee in Retail Shop
  console.log('\n[3] Adding a new employee (Alex Rivera - Staff)...');
  const newEmpPayload = {
    name: 'Alex Rivera',
    email: 'alex.rivera@retailshop.io',
    role: 'staff',
    department: 'Front Counter Checkout',
    password: 'password123',
    bio: 'Evening shift counter cashier and receipt handler',
  };
  const createRes = await fetch(`${BASE_URL}/tenants/employees`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(newEmpPayload),
  });
  const createData = await createRes.json();
  assert(createRes.status === 201, `POST /api/tenants/employees returned 201 Created (Got: ${createRes.status})`);
  assert(createData.success === true, 'Employee created successfully');
  assert(createData.data.email === 'alex.rivera@retailshop.io', 'Created employee has correct email');
  assert(createData.data.tenantId === 'tenant-retail', 'New employee assigned strictly to tenant-retail');
  const createdId = createData.data.id || createData.data._id;

  // 4. Update the Employee (Promote to Manager)
  console.log('\n[4] Updating employee: Promoting Alex to Manager...');
  const updateRes = await fetch(`${BASE_URL}/tenants/employees/${createdId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      role: 'manager',
      department: 'Store Operations',
      bio: 'Promoted to Operations Manager supervising inventory and counter operations',
    }),
  });
  const updateData = await updateRes.json();
  assert(updateRes.status === 200, `PUT /api/tenants/employees/${createdId} returned 200 OK (Got: ${updateRes.status})`);
  assert(updateData.data.role === 'manager', `Role successfully updated to manager (Got: ${updateData.data.role})`);
  assert(updateData.data.department === 'Store Operations', 'Department updated to Store Operations');

  // 5. Verify Self-Deletion Guard
  console.log('\n[5] Verifying Self-Deletion Protection...');
  const selfDelRes = await fetch(`${BASE_URL}/tenants/employees/user-shop-admin`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  const selfDelData = await selfDelRes.json();
  assert(selfDelRes.status === 400, `Attempting to delete own account returned 400 Bad Request (Got: ${selfDelRes.status})`);
  assert(selfDelData.message.includes('own administrator account'), 'Returned protection error message');

  // 6. Delete the created employee
  console.log('\n[6] Removing the created employee from company workforce...');
  const delRes = await fetch(`${BASE_URL}/tenants/employees/${createdId}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  const delData = await delRes.json();
  assert(delRes.status === 200, `DELETE returned 200 OK (Got: ${delRes.status})`);
  assert(delData.success === true, 'Employee deleted successfully');

  // Verify employee is no longer in list
  const verifyRes = await fetch(`${BASE_URL}/tenants/employees`, {
    headers: adminHeaders,
  });
  const verifyData = await verifyRes.json();
  const stillExists = verifyData.data.some((e) => (e.id || e._id) === createdId);
  assert(!stillExists, 'Alex Rivera is confirmed removed from the workforce list');

  // 7. Verify RBAC Security Guard: Staff Cannot Access Employee Management
  console.log('\n[7] Verifying RBAC Security: Authenticating as Staff (staff@retailshop.io)...');
  const staffLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'staff@retailshop.io', password: 'password123' }),
  });
  const staffLoginData = await staffLoginRes.json();
  assert(staffLoginData.success && staffLoginData.token, 'Staff authenticated');

  const staffHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${staffLoginData.token}`,
    'X-Tenant-ID': 'tenant-retail',
  };

  const staffAccessRes = await fetch(`${BASE_URL}/tenants/employees`, {
    headers: staffHeaders,
  });
  assert(
    staffAccessRes.status === 403,
    `Staff access to /api/tenants/employees blocked with 403 Forbidden (Got: ${staffAccessRes.status})`
  );

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed === total) {
    console.log('ALL EMPLOYEE MANAGEMENT TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
