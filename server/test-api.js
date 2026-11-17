import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);
  const cookie = response.headers.get('set-cookie');

  return {
    status: response.status,
    ok: response.ok,
    data,
    cookie,
  };
}

let adminCookie = '';
let userCookie = '';
let testUserId = '';
let testRoleId = '';
let testRecordId = '';

async function runTests() {
  console.log('--- STARTING GROWTH TECH END-TO-END API TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('\n[1. System Health]');
    const health = await request('/health');
    assert(health.status === 200 && health.data?.status === 'ok', 'GET /api/health returned 200 OK');

    // 2. Auth Tests
    console.log('\n[2. Authentication & Authorization]');
    // Inactive user login check
    const inactiveLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'rachel.green@growthtech.com', password: 'User@1234' }),
    });
    assert(
      inactiveLogin.status === 403 && inactiveLogin.data?.message?.includes('deactivated'),
      'Inactive user login is correctly rejected with 403 Forbidden'
    );

    // Invalid credentials check
    const badLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@growthtech.com', password: 'WrongPassword@123' }),
    });
    assert(badLogin.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // Admin Login at /auth/admin/login
    const adminLogin = await request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@growthtech.com', password: 'Admin@1234' }),
    });
    assert(
      adminLogin.status === 200 && adminLogin.data?.data?.user?.role?.name === 'admin',
      'POST /api/auth/admin/login succeeds for system admin'
    );
    assert(!adminLogin.data?.data?.user?.password, 'Password hash is excluded from response');
    adminCookie = adminLogin.cookie?.split(';')[0] || '';

    // Standard User Login
    const userLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'elena.rostova@growthtech.com', password: 'User@1234' }),
    });
    assert(userLogin.status === 200, 'POST /api/auth/login succeeds for standard user');
    userCookie = userLogin.cookie?.split(';')[0] || '';

    // Standard user attempting Admin Login
    const regularUserOnAdminLogin = await request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'elena.rostova@growthtech.com', password: 'User@1234' }),
    });
    assert(
      regularUserOnAdminLogin.status === 403 && regularUserOnAdminLogin.data?.message?.includes('Administrator privileges required'),
      'Standard user is blocked from /api/auth/admin/login with 403 Forbidden'
    );

    // Current User Session (GET /auth/me)
    const meAdmin = await request('/auth/me', {
      headers: { Cookie: adminCookie },
    });
    assert(
      meAdmin.status === 200 && meAdmin.data?.data?.user?.email === 'admin@growthtech.com',
      'GET /api/auth/me returns admin user session'
    );

    // 3. Dashboard Stats Tests
    console.log('\n[3. Aggregated Dashboard Statistics]');
    const adminStats = await request('/dashboard/stats', {
      headers: { Cookie: adminCookie },
    });
    assert(
      adminStats.status === 200 &&
      adminStats.data?.data?.isAdmin === true &&
      adminStats.data?.data?.stats?.totalUsers >= 11 &&
      adminStats.data?.data?.charts?.usersByRole?.length > 0 &&
      adminStats.data?.data?.charts?.registrationsLast6Months?.length === 6,
      'Admin stats aggregation pipeline returns complete metrics, charts & recent records'
    );

    const userStats = await request('/dashboard/stats', {
      headers: { Cookie: userCookie },
    });
    assert(
      userStats.status === 200 &&
      userStats.data?.data?.isAdmin === false &&
      userStats.data?.data?.profile?.name === 'Elena Rostova',
      'User stats returns personal workspace metrics and profile summary'
    );

    // 4. User Management Tests
    console.log('\n[4. User Management CRUD & Protection]');
    // List Users with pagination & search
    const usersList = await request('/users?page=1&limit=5&search=chen', {
      headers: { Cookie: adminCookie },
    });
    assert(
      usersList.status === 200 && usersList.data?.data?.length === 1 && usersList.data.data[0].email === 'david.chen@growthtech.com',
      'GET /api/users supports search and filtering'
    );

    // Create User
    const rolesList = await request('/roles', { headers: { Cookie: adminCookie } });
    const userRole = rolesList.data?.data?.roles?.find((r) => r.name === 'user');

    const createdUser = await request('/users', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Automated Test User',
        email: 'test.auto@growthtech.com',
        password: 'Password@123',
        role: userRole?._id,
        status: 'active',
      }),
    });
    assert(createdUser.status === 201, 'POST /api/users creates a new user account');
    testUserId = createdUser.data?.data?._id;

    // Toggle User Status
    const toggleStatus = await request(`/users/${testUserId}/status`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({ status: 'inactive' }),
    });
    assert(
      toggleStatus.status === 200 && toggleStatus.data?.data?.status === 'inactive',
      'PATCH /api/users/:id/status deactivates user'
    );

    // Self-Deactivation / Self-Deletion Protection
    const currentAdminUser = meAdmin.data?.data?.user;
    const selfDeactivate = await request(`/users/${currentAdminUser._id}/status`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({ status: 'inactive' }),
    });
    assert(
      selfDeactivate.status === 400 && selfDeactivate.data?.message?.includes('cannot change the status of your own'),
      'Admin is strictly protected from deactivating own account (400 Bad Request)'
    );

    const selfDelete = await request(`/users/${currentAdminUser._id}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(
      selfDelete.status === 400 && selfDelete.data?.message?.includes('cannot delete your own'),
      'Admin is strictly protected from deleting own account (400 Bad Request)'
    );

    // Delete created test user
    const deleteTestUser = await request(`/users/${testUserId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(deleteTestUser.status === 200, 'DELETE /api/users/:id deletes non-self user');

    // 5. Role Management & Permission Matrix
    console.log('\n[5. Role Management & Access Control]');
    // Create Custom Role
    const newRole = await request('/roles', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        name: 'qa-tester',
        displayName: 'QA Tester',
        description: 'Quality assurance engineer with project read rights',
        permissions: ['records:read'],
      }),
    });
    assert(newRole.status === 201, 'POST /api/roles creates custom role');
    testRoleId = newRole.data?.data?._id;

    // Update Role Permissions
    const updateRole = await request(`/roles/${testRoleId}`, {
      method: 'PUT',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        displayName: 'Senior QA Tester',
        permissions: ['records:read', 'records:write'],
      }),
    });
    assert(
      updateRole.status === 200 && updateRole.data?.data?.permissions?.includes('records:write'),
      'PUT /api/roles/:id updates role permissions matrix'
    );

    // Protected System Role Deletion
    const deleteAdminRole = await request(`/roles/${currentAdminUser.role._id}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(
      deleteAdminRole.status === 400 && deleteAdminRole.data?.message?.includes('System roles cannot be deleted'),
      'System role deletion is rejected with 400 Bad Request'
    );

    // Delete custom role
    const deleteCustomRole = await request(`/roles/${testRoleId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(deleteCustomRole.status === 200, 'DELETE /api/roles/:id deletes unused custom role');

    // 6. Project Records CRUD
    console.log('\n[6. Project Records CRUD & Ownership]');
    // Create record as user
    const createRec = await request('/records', {
      method: 'POST',
      headers: { Cookie: userCookie },
      body: JSON.stringify({
        title: 'User Personal Webhook Service',
        description: 'Build incoming webhook ingestion service for third-party alerts.',
        category: 'Engineering',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      }),
    });
    assert(createRec.status === 201, 'POST /api/records creates project record');
    testRecordId = createRec.data?.data?._id;

    // Read record
    const getRec = await request(`/records/${testRecordId}`, {
      headers: { Cookie: userCookie },
    });
    assert(getRec.status === 200 && getRec.data?.data?.title === 'User Personal Webhook Service', 'GET /api/records/:id retrieves created record');

    // Update record
    const updateRec = await request(`/records/${testRecordId}`, {
      method: 'PUT',
      headers: { Cookie: userCookie },
      body: JSON.stringify({
        status: 'in-progress',
        priority: 'medium',
      }),
    });
    assert(updateRec.status === 200 && updateRec.data?.data?.status === 'in-progress', 'PUT /api/records/:id updates record status');

    // Delete record
    const deleteRec = await request(`/records/${testRecordId}`, {
      method: 'DELETE',
      headers: { Cookie: userCookie },
    });
    assert(deleteRec.status === 200, 'DELETE /api/records/:id deletes project record');

    // 7. Logout
    console.log('\n[7. Logout & Session Termination]');
    const logoutRes = await request('/auth/logout', {
      method: 'POST',
      headers: { Cookie: userCookie },
    });
    assert(logoutRes.status === 200, 'POST /api/auth/logout clears session');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n=================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

