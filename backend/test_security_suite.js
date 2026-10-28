const BASE_URL = 'http://localhost:5000/api';

async function runSecurityTests() {
  console.log('=== STARTING ENTERPRISE SECURITY, BCRYPT, JWT, OTP & DDOS/INJECTION SUITE ===\n');

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

  // 1. Bcrypt Password Verification & Authentication
  console.log('[1] Testing Bcrypt Password Salting & Authentication...');
  const validLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io', password: 'password123' }),
  });
  const validLoginData = await validLoginRes.json();
  assert(validLoginRes.status === 200, `Valid login returned 200 OK (Got: ${validLoginRes.status})`);
  assert(validLoginData.token && validLoginData.token.split('.').length === 3, 'Received cryptographically signed 3-part JWT');

  const invalidLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io', password: 'wrongpassword999' }),
  });
  const invalidLoginData = await invalidLoginRes.json();
  assert(invalidLoginRes.status === 401, `Invalid password rejected with 401 Unauthorized (Got: ${invalidLoginRes.status})`);
  assert(invalidLoginData.code === 'AUTH_INVALID_CREDENTIALS', 'Returned AUTH_INVALID_CREDENTIALS error code');

  // 2. Security Headers & CORS Preflight
  console.log('\n[2] Testing Enterprise Security Headers & CORS Preflight...');
  const optionsRes = await fetch(`${BASE_URL}/health`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:5173',
      'Access-Control-Request-Method': 'GET',
    },
  });
  const allowOrigin = optionsRes.headers.get('access-control-allow-origin');
  assert(allowOrigin === 'http://localhost:5173', `CORS allowed origin confirmed: ${allowOrigin}`);

  const healthRes = await fetch(`${BASE_URL}/health`);
  assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff present');
  assert(healthRes.headers.get('x-frame-options') === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN present');
  assert(healthRes.headers.get('x-xss-protection') === '1; mode=block', 'X-XSS-Protection: 1; mode=block present');

  // 3. NoSQL Operator & SQL Injection Sanitization
  console.log('\n[3] Testing SQL & NoSQL Injection Protection...');
  const nosqlRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: { $gt: '' }, // Dangerous NoSQL operator attempt
      password: "' OR 1=1 --", // Dangerous SQL injection attempt
    }),
  });
  assert(nosqlRes.status === 400, `NoSQL operator / SQL injection attack blocked with 400 Bad Request (Got: ${nosqlRes.status})`);

  // 4. Forgot Password & OTP Flow
  console.log('\n[4] Testing Forgot Password & 6-Digit OTP System...');
  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io' }),
  });
  const forgotData = await forgotRes.json();
  assert(forgotRes.status === 200, `POST /api/auth/forgot-password returned 200 OK (Got: ${forgotRes.status})`);
  assert(forgotData.success === true, 'OTP generated successfully');
  assert(forgotData.devOtp && forgotData.devOtp.length === 6, `Generated 6-digit OTP: ${forgotData.devOtp}`);

  const generatedOtp = forgotData.devOtp;

  // 4b. Test Invalid OTP Attempt
  console.log('   Testing Invalid OTP Code Rejection...');
  const badOtpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io', otp: '000000' }),
  });
  const badOtpData = await badOtpRes.json();
  assert(badOtpRes.status === 400, `Invalid OTP rejected with 400 Bad Request (Got: ${badOtpRes.status})`);
  assert(badOtpData.code === 'INVALID_OTP', 'Returned INVALID_OTP error code');

  // 4c. Test Valid OTP Verification & Reset Token Issuance
  console.log('   Testing Valid OTP Verification...');
  const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io', otp: generatedOtp }),
  });
  const verifyData = await verifyRes.json();
  assert(verifyRes.status === 200, `Valid OTP returned 200 OK (Got: ${verifyRes.status})`);
  assert(verifyData.resetToken && verifyData.resetToken.length === 64, 'Received 64-char cryptographic resetToken');

  const resetToken = verifyData.resetToken;

  // 4d. Reset Password to new password
  console.log('   Testing Password Reset with Bcrypt Salting...');
  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@retailshop.io',
      resetToken,
      newPassword: 'newsecurepass456',
      confirmPassword: 'newsecurepass456',
    }),
  });
  const resetData = await resetRes.json();
  assert(resetRes.status === 200, `POST /api/auth/reset-password returned 200 OK (Got: ${resetRes.status})`);
  assert(resetData.success === true, 'Password reset confirmation received');

  // 4e. Verify old password no longer works
  console.log('   Verifying old password is now rejected...');
  const oldLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io', password: 'password123' }),
  });
  assert(oldLoginRes.status === 401, 'Old password successfully invalidated');

  // 4f. Verify new password logs in successfully
  console.log('   Verifying new password logs in with JWT...');
  const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io', password: 'newsecurepass456' }),
  });
  const newLoginData = await newLoginRes.json();
  assert(newLoginRes.status === 200, 'New password authenticated with 200 OK');
  assert(newLoginData.token, 'Authenticated session token received');

  // 4g. Reset password back to standard 'password123' for ongoing tests
  console.log('\n[5] Restoring standard password (password123) for test consistency...');
  const restoreForgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io' }),
  });
  const restoreForgotData = await restoreForgotRes.json();
  const restoreVerifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io', otp: restoreForgotData.devOtp }),
  });
  const restoreVerifyData = await restoreVerifyRes.json();
  await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@retailshop.io',
      resetToken: restoreVerifyData.resetToken,
      newPassword: 'password123',
      confirmPassword: 'password123',
    }),
  });
  const restoredLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailshop.io', password: 'password123' }),
  });
  assert(restoredLoginRes.status === 200, 'Standard test credentials successfully restored');

  console.log(`\n========================================`);
  console.log(`SECURITY RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed === total) {
    console.log('ALL ENTERPRISE SECURITY TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('SOME SECURITY TESTS FAILED!\n');
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Security test suite execution error:', err);
  process.exit(1);
});
