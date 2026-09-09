import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000/api';

async function runAudit() {
  console.log('====================================================');
  console.log('   KISANKENDRA COMPREHENSIVE SYSTEM AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. DATABASE SCHEMA & INTEGRITY AUDIT
    console.log('--- 1. DATABASE SCHEMA & INTEGRITY (SQLite: dev.db) ---');
    const userCount = await prisma.user.count();
    const centreCount = await prisma.centre.count();
    const tokenCount = await prisma.token.count();
    
    assert(userCount > 0, `Users table populated (${userCount} records in dev.db)`);
    assert(centreCount > 0, `Centres table populated (${centreCount} records in dev.db)`);
    assert(tokenCount >= 0, `Tokens table accessible (${tokenCount} records in dev.db)`);

    // Verify relations
    const sampleToken = await prisma.token.findFirst({
      include: { farmer: true, centre: true }
    });
    if (sampleToken) {
      assert(sampleToken.farmer !== null, `Token relation to User/Farmer valid (${sampleToken.farmer.name})`);
      assert(sampleToken.centre !== null, `Token relation to Centre valid (${sampleToken.centre.name})`);
    }

    // 2. BACKEND API HEALTH
    console.log('\n--- 2. BACKEND API HEALTH CHECK ---');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.ok && healthJson.status === 'ok', 'GET /api/health returns 200 OK');

    // 3. AUTHENTICATION (REGISTER, LOGIN, PROFILE)
    console.log('\n--- 3. AUTHENTICATION & SECURITY AUDIT ---');
    const testPhone = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Farmer',
        phone: testPhone,
        password: 'password123',
        role: 'FARMER',
        state: 'Haryana',
        district: 'Karnal',
        village: 'Nilokheri'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success && regData.token, 'POST /api/auth/register creates user with JWT token');

    // Test duplicate phone prevention
    const dupRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Farmer Dup',
        phone: testPhone,
        password: 'password123',
      })
    });
    assert(dupRes.status === 400, 'POST /api/auth/register rejects duplicate phone number');

    // Test Login
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: testPhone,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'POST /api/auth/login authenticates registered user');

    const farmerToken = loginData.token;

    // Test invalid password
    const badLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: testPhone,
        password: 'wrong_password'
      })
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login rejects incorrect password');

    // Test Profile GET & PUT
    const profRes = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const profData = await profRes.json();
    assert(profRes.ok && profData.user.phone === testPhone, 'GET /api/auth/profile returns correct farmer profile');

    const updateProfRes = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({ village: 'Karnal Sub-Division' })
    });
    const updateProfData = await updateProfRes.json();
    assert(updateProfData.user.village === 'Karnal Sub-Division', 'PUT /api/auth/profile persists updates to database');

    // 4. PROCUREMENT CENTRES AUDIT
    console.log('\n--- 4. PROCUREMENT CENTRES AUDIT ---');
    const centresRes = await fetch(`${API_URL}/centres`);
    const centresData = await centresRes.json();
    assert(centresRes.ok && Array.isArray(centresData.centres), 'GET /api/centres returns centres list');
    const testCentre = centresData.centres[0];
    assert(testCentre && testCentre.id, `Valid procurement centre retrieved: "${testCentre.name}"`);

    // 5. SLOTS AVAILABILITY AUDIT
    console.log('\n--- 5. SLOTS AVAILABILITY ENGINE AUDIT ---');
    const today = new Date().toISOString().split('T')[0];
    const slotRes = await fetch(`${API_URL}/tokens/slots-availability?centreId=${testCentre.id}&date=${today}`);
    const slotData = await slotRes.json();
    assert(slotRes.ok && slotData.slots.length > 0, `Slot availability engine computed ${slotData.slots.length} time windows`);
    assert(slotData.recommendedSlot !== undefined, `AI recommends optimal slot: "${slotData.recommendedSlot}"`);

    // 6. TOKEN BOOKING & LIFECYCLE AUDIT
    console.log('\n--- 6. TOKEN BOOKING & QUEUE LIFECYCLE AUDIT ---');
    const bookRes = await fetch(`${API_URL}/tokens/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        centreId: testCentre.id,
        cropType: 'Wheat (Sharbati / Common)',
        estimatedWeight: 45.5,
        vehicleNumber: 'HR-05-ZZ-9999 (Tractor Trolley)',
        slotDate: today,
        slotTime: slotData.recommendedSlot || '10:00 AM - 11:00 AM'
      })
    });
    const bookData = await bookRes.json();
    assert(bookRes.status === 201 && bookData.token?.tokenNumber, `Token successfully booked: ${bookData.token?.tokenNumber}`);

    const newTokenId = bookData.token.id;

    // Verify token appears in My Tokens
    const myTokensRes = await fetch(`${API_URL}/tokens/my-tokens`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const myTokensData = await myTokensRes.json();
    const foundToken = myTokensData.tokens.find(t => t.id === newTokenId);
    assert(foundToken !== undefined, 'New token appears in GET /api/tokens/my-tokens');
    assert(foundToken.status === 'BOOKED', 'Token initialized with BOOKED status');

    // Test Gate Call: Status transition BOOKED -> CALLED
    const callRes = await fetch(`${API_URL}/tokens/${newTokenId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({ status: 'CALLED' })
    });
    const callData = await callRes.json();
    assert(callData.token?.status === 'CALLED', 'Status updated to CALLED (Proceed to Gate)');

    // Test Weighbridge: Status transition CALLED -> IN_PROGRESS
    const progRes = await fetch(`${API_URL}/tokens/${newTokenId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({ status: 'IN_PROGRESS' })
    });
    const progData = await progRes.json();
    assert(progData.token?.status === 'IN_PROGRESS', 'Status updated to IN_PROGRESS (Active on Weighbridge)');

    // Test Completion: Status transition IN_PROGRESS -> COMPLETED
    const compRes = await fetch(`${API_URL}/tokens/${newTokenId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        status: 'COMPLETED',
        actualWeight: 46.2,
        moistureLevel: 11.4
      })
    });
    const compData = await compRes.json();
    assert(compData.token?.status === 'COMPLETED', 'Status updated to COMPLETED (Form-J Issued)');
    assert(compData.token?.actualWeight === 46.2, 'Actual weight stored properly in SQLite DB');

    // Test Completed token cannot be cancelled
    const badCancelRes = await fetch(`${API_URL}/tokens/${newTokenId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({ reason: 'Try cancel completed' })
    });
    assert(badCancelRes.status === 400, 'System protects COMPLETED tokens from cancellation');

    // 7. REAL-TIME QUEUE RECALCULATION & FIFO METRICS
    console.log('\n--- 7. LIVE QUEUE TELEMETRY AUDIT ---');
    const queueRes = await fetch(`${API_URL}/queue/${testCentre.id}`);
    const queueData = await queueRes.json();
    assert(queueRes.ok && queueData.stats !== undefined, 'GET /api/queue/:centreId returns structured FIFO statistics');
    assert(typeof queueData.stats.totalInQueue === 'number', `Live queue count tracked accurately (${queueData.stats.totalInQueue} vehicles)`);

    // 8. DATABASE ANALYTICS COMPUTATION
    console.log('\n--- 8. ANALYTICS & MSP SETTLEMENT ENGINE AUDIT ---');
    const anaRes = await fetch(`${API_URL}/tokens/analytics`);
    const anaData = await anaRes.json();
    assert(anaRes.ok && anaData.analytics.totalTokens > 0, `Total tokens computed: ${anaData.analytics.totalTokens}`);
    assert(anaData.analytics.completedTokens > 0, `Completed tokens count: ${anaData.analytics.completedTokens}`);
    assert(anaData.analytics.totalMSPDisbursed.includes('₹'), `MSP disbursement calculated: ${anaData.analytics.totalMSPDisbursed}`);

    console.log('\n====================================================');
    console.log(`   AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('Fatal audit error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();
