import mongoose from 'mongoose';
import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { generateAccessToken } from '../src/utils/generateToken.js';
import User from '../src/models/User.js';
import Business from '../src/models/Business.js';
import Job from '../src/modules/jobs/jobs.model.js';
import Customer from '../src/modules/customers/customers.model.js';
import Staff from '../src/modules/staff/staff.model.js';
import app from '../src/app.js';

const PORT = 5060;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || 'sparklepro_jwt_secret_key_2026';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sparklepro';

let server;
let ownerAToken;
let ownerBToken;
let staffToken;
let ownerAUser;
let ownerBUser;
let ownerABusiness;
let ownerBBusiness;

const testResults = [];

function recordTest(testName, passed, details = '') {
  testResults.push({ testName, status: passed ? 'PASS' : 'FAIL', details });
  console.log(`--- ${testName}: ${passed ? 'PASS' : 'FAIL'} (${details}) ---`);
}

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || '';
        let data = buffer.toString('utf8');
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }
        resolve({ status: res.statusCode, data, headers: res.headers, rawBuffer: buffer });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runSettingsTestSuite() {
  console.log('================================================================');
  console.log(' SPARKLEPRO MODULE 7 SETTINGS BACKEND TEST SUITE');
  console.log('================================================================\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully');

    await new Promise((resolve) => {
      server = app.listen(PORT, '127.0.0.1', () => {
        console.log(`[Module 7 Test Server] Running on port ${PORT}\n`);
        resolve();
      });
    });

    // Cleanup existing test data
    await User.deleteMany({ email: { $in: ['settings_owner_a@sparklepro.com', 'settings_owner_b@sparklepro.com', 'settings_staff@sparklepro.com'] } });
    await Business.deleteMany({ email: { $in: ['settings_owner_a@sparklepro.com', 'settings_owner_b@sparklepro.com'] } });

    // Seed Owner A
    ownerAUser = new User({
      fullName: 'Settings Owner A',
      email: 'settings_owner_a@sparklepro.com',
      password: 'password123',
      role: 'OWNER',
      isEmailVerified: true,
    });
    await ownerAUser.save();

    ownerABusiness = new Business({
      ownerId: ownerAUser._id,
      name: 'Owner A Detailing Spa',
      ownerName: 'Settings Owner A',
      email: 'settings_owner_a@sparklepro.com',
      mobileNumber: '+91 99999 11111',
      address: '123 Main St, Bangalore',
      taxId: 'TAX-AAA-111',
      setupCompleted: true,
    });
    await ownerABusiness.save();

    ownerAToken = generateAccessToken({
      userId: ownerAUser._id.toString(),
      role: 'OWNER',
      businessId: ownerABusiness._id.toString(),
    });

    // Seed Owner B
    ownerBUser = new User({
      fullName: 'Settings Owner B',
      email: 'settings_owner_b@sparklepro.com',
      password: 'password123',
      role: 'OWNER',
      isEmailVerified: true,
    });
    await ownerBUser.save();

    ownerBBusiness = new Business({
      ownerId: ownerBUser._id,
      name: 'Owner B Speed Wash',
      ownerName: 'Settings Owner B',
      email: 'settings_owner_b@sparklepro.com',
      mobileNumber: '+91 88888 22222',
      address: '456 Alternate Rd, Mysore',
      taxId: 'TAX-BBB-222',
      setupCompleted: true,
    });
    await ownerBBusiness.save();

    ownerBToken = generateAccessToken({
      userId: ownerBUser._id.toString(),
      role: 'OWNER',
      businessId: ownerBBusiness._id.toString(),
    });

    // Seed Staff User
    const staffUser = new User({
      fullName: 'Settings Staff User',
      email: 'settings_staff@sparklepro.com',
      password: 'password123',
      role: 'STAFF',
    });
    await staffUser.save();

    staffToken = generateAccessToken({
      userId: staffUser._id.toString(),
      role: 'STAFF',
      businessId: ownerABusiness._id.toString(),
    });

    // --- TEST 1: GET Unified Settings Context ---
    const t1 = await makeRequest('GET', '/api/owner/settings', null, ownerAToken);
    const t1Pass = t1.status === 200 && t1.data?.success && t1.data?.data?.business?.name === 'Owner A Detailing Spa';
    recordTest('Test 1: GET Settings Unified Endpoint Works', t1Pass, `Status: ${t1.status}`);

    // --- TEST 2: GET Settings Returns Business Data ---
    const bData = t1.data?.data?.business;
    const t2Pass = bData && bData.taxId === 'TAX-AAA-111' && bData.mobileNumber === '+91 99999 11111';
    recordTest('Test 2: GET Settings Returns Correct Business Profile', t2Pass, `Business Name: ${bData?.name}`);

    // --- TEST 3: GET Settings Returns User Data ---
    const uData = t1.data?.data?.user;
    const t3Pass = uData && uData.fullName === 'Settings Owner A' && uData.role === 'OWNER';
    recordTest('Test 3: GET Settings Returns Correct User Profile', t3Pass, `User Email: ${uData?.email}`);

    // --- TEST 4: Password Excluded from GET Settings ---
    const t4Pass = uData && uData.password === undefined && t1.data?.data?.password === undefined;
    recordTest('Test 4: Password Strictly Excluded from Settings API Response', t4Pass, 'Password field not exposed');

    // --- TEST 5: PATCH Profile Works ---
    const t5 = await makeRequest('PATCH', '/api/owner/settings/profile', {
      companyName: 'Owner A Premium Spa',
      ownerName: 'Owner A Modified',
      taxId: 'TAX-MOD-999',
      email: 'settings_owner_a@sparklepro.com',
      phone: '+91 99999 88888',
      address: '789 Updated Blvd, Bangalore',
    }, ownerAToken);
    const t5Pass = t5.status === 200 && t5.data?.data?.business?.name === 'Owner A Premium Spa' && t5.data?.data?.business?.taxId === 'TAX-MOD-999';
    recordTest('Test 5: PATCH Business Profile Endpoint Updates Fields', t5Pass, `Updated Name: ${t5.data?.data?.business?.name}`);

    // --- TEST 6: Profile Validation (Empty Company Name) ---
    const t6 = await makeRequest('PATCH', '/api/owner/settings/profile', {
      companyName: ' ',
      email: 'settings_owner_a@sparklepro.com',
    }, ownerAToken);
    const t6Pass = t6.status === 400;
    recordTest('Test 6: Invalid Company Name Rejected', t6Pass, `Status: ${t6.status}`);

    // --- TEST 7: Profile Validation (Invalid Email) ---
    const t7 = await makeRequest('PATCH', '/api/owner/settings/profile', {
      companyName: 'Owner A Premium Spa',
      email: 'invalid-email-format',
    }, ownerAToken);
    const t7Pass = t7.status === 400;
    recordTest('Test 7: Invalid Email Address Format Rejected', t7Pass, `Status: ${t7.status}`);

    // --- TEST 8: Address Length Validation (>300 chars) ---
    const t8 = await makeRequest('PATCH', '/api/owner/settings/profile', {
      companyName: 'Owner A Premium Spa',
      email: 'settings_owner_a@sparklepro.com',
      address: 'A'.repeat(305),
    }, ownerAToken);
    const t8Pass = t8.status === 400;
    recordTest('Test 8: Address Exceeding 300 Characters Rejected', t8Pass, `Status: ${t8.status}`);

    // --- TEST 9: PATCH Workshop Settings Works ---
    const t9 = await makeRequest('PATCH', '/api/owner/settings/workshop', {
      capacity: 45,
      allowOverbooking: true,
      peakSurge: false,
      openingTime: '07:30 AM',
      closingTime: '08:30 PM',
      weeklyHolidays: ['Sunday'],
      bays: [
        { bayId: 1, name: 'Bay 1 Express', type: 'Washing', active: true },
        { bayId: 2, name: 'Bay 2 Ceramic', type: 'Coating', active: true },
      ],
    }, ownerAToken);
    const t9Pass = t9.status === 200 && t9.data?.data?.business?.capacity === 45 && t9.data?.data?.business?.allowOverbooking === true;
    recordTest('Test 9: PATCH Workshop Settings Updates Capacity & Rules', t9Pass, `Capacity: ${t9.data?.data?.business?.capacity}`);

    // --- TEST 10: Workshop Capacity Minimum Validation (<1) ---
    const t10 = await makeRequest('PATCH', '/api/owner/settings/workshop', { capacity: 0 }, ownerAToken);
    const t10Pass = t10.status === 400;
    recordTest('Test 10: Capacity < 1 Rejected', t10Pass, `Status: ${t10.status}`);

    // --- TEST 11: Workshop Capacity Maximum Validation (>500) ---
    const t11 = await makeRequest('PATCH', '/api/owner/settings/workshop', { capacity: 999 }, ownerAToken);
    const t11Pass = t11.status === 400;
    recordTest('Test 11: Capacity > 500 Rejected', t11Pass, `Status: ${t11.status}`);

    // --- TEST 12: Invalid Weekly Holiday Validation ---
    const t12 = await makeRequest('PATCH', '/api/owner/settings/workshop', { weeklyHolidays: ['Funday'] }, ownerAToken);
    const t12Pass = t12.status === 400;
    recordTest('Test 12: Invalid Day of Week in Holidays Rejected', t12Pass, `Status: ${t12.status}`);

    // --- TEST 13: GET Services & Pricing ---
    const t13 = await makeRequest('GET', '/api/owner/settings/services', null, ownerAToken);
    const t13Pass = t13.status === 200 && Array.isArray(t13.data?.data?.servicesConfigured);
    recordTest('Test 13: GET Services Management Configuration Endpoint Works', t13Pass, `Configured services count: ${t13.data?.data?.servicesConfigured?.length}`);

    // --- TEST 14: PUT Services & Pricing Update ---
    const updatedServices = [
      { name: 'Foam Wash Express', category: 'Car', duration: '30 mins', startingPrice: '₹350', enabled: true },
      { name: 'Full Ceramic Spa', category: 'SUV', duration: '180 mins', startingPrice: '₹2,500', enabled: true },
    ];
    const t14 = await makeRequest('PUT', '/api/owner/settings/services', { servicesConfigured: updatedServices }, ownerAToken);
    const t14Pass = t14.status === 200 && t14.data?.data?.servicesConfigured?.length === 2 && t14.data?.data?.servicesConfigured[0]?.name === 'Foam Wash Express';
    recordTest('Test 14: PUT Services Package Updates Successfully', t14Pass, `First Service Name: ${t14.data?.data?.servicesConfigured[0]?.name}`);

    // --- TEST 15: PATCH Notification Preferences ---
    const t15 = await makeRequest('PATCH', '/api/owner/settings/notifications', {
      emailAlerts: false,
      smsReminders: true,
      pushNotifs: true,
      jobComplete: false,
      weeklyReport: true,
    }, ownerAToken);
    const t15Pass = t15.status === 200 && t15.data?.data?.emailAlerts === false && t15.data?.data?.weeklyReport === true;
    recordTest('Test 15: PATCH Notification Preferences Updates Toggles', t15Pass, `Weekly Report: ${t15.data?.data?.weeklyReport}`);

    // --- TEST 16: PATCH 2FA Preference Toggle ---
    const t16 = await makeRequest('PATCH', '/api/owner/settings/security/2fa', { twoFactorEnabled: true }, ownerAToken);
    const t16Pass = t16.status === 200 && t16.data?.data?.twoFactorEnabled === true;
    recordTest('Test 16: PATCH 2FA Preference Toggle Updates User Setting', t16Pass, `2FA Enabled: ${t16.data?.data?.twoFactorEnabled}`);

    // --- TEST 17: PATCH Password Change Success ---
    const t17 = await makeRequest('PATCH', '/api/owner/settings/security/password', {
      currentPassword: 'password123',
      newPassword: 'newSecurePassword123',
      confirmPassword: 'newSecurePassword123',
    }, ownerAToken);
    const t17Pass = t17.status === 200 && t17.data?.success;
    recordTest('Test 17: PATCH Admin Password Change Succeeds with Valid Password', t17Pass, `Status: ${t17.status}`);

    // --- TEST 18: Verify Login with New Password ---
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'settings_owner_a@sparklepro.com',
      password: 'newSecurePassword123',
    });
    const t18Pass = loginRes.status === 200 && loginRes.data?.success;
    recordTest('Test 18: Owner Account Authenticates with Updated Password', t18Pass, 'Bcrypt hash comparison verified');

    if (loginRes.data?.token) ownerAToken = loginRes.data.token;

    // --- TEST 19: Password Change Fails with Incorrect Current Password ---
    const t19 = await makeRequest('PATCH', '/api/owner/settings/security/password', {
      currentPassword: 'wrongPassword123',
      newPassword: 'anotherPassword123',
      confirmPassword: 'anotherPassword123',
    }, ownerAToken);
    const t19Pass = t19.status === 400;
    recordTest('Test 19: Incorrect Current Password Rejected', t19Pass, `Status: ${t19.status}`);

    // --- TEST 20: Password Change Fails when < 8 Characters ---
    const t20 = await makeRequest('PATCH', '/api/owner/settings/security/password', {
      currentPassword: 'newSecurePassword123',
      newPassword: 'short',
      confirmPassword: 'short',
    }, ownerAToken);
    const t20Pass = t20.status === 400;
    recordTest('Test 20: Password Less Than 8 Characters Rejected', t20Pass, `Status: ${t20.status}`);

    // --- TEST 21: Password Confirmation Mismatch Rejected ---
    const t21 = await makeRequest('PATCH', '/api/owner/settings/security/password', {
      currentPassword: 'newSecurePassword123',
      newPassword: 'validPassword123',
      confirmPassword: 'mismatchedPassword123',
    }, ownerAToken);
    const t21Pass = t21.status === 400;
    recordTest('Test 21: Password Confirmation Mismatch Rejected', t21Pass, `Status: ${t21.status}`);

    // --- TEST 22: GET Backup Export Weekly CSV ---
    const t22 = await makeRequest('GET', '/api/owner/settings/backup/export?type=weekly', null, ownerAToken);
    const t22Pass = t22.status === 200 && t22.headers['content-type']?.includes('text/csv');
    recordTest('Test 22: Backup Export Weekly CSV Streamed Successfully', t22Pass, `Content-Type: ${t22.headers['content-type']}`);

    // --- TEST 23: GET Backup Export Monthly CSV ---
    const t23 = await makeRequest('GET', '/api/owner/settings/backup/export?type=monthly', null, ownerAToken);
    const t23Pass = t23.status === 200 && t23.headers['content-type']?.includes('text/csv');
    recordTest('Test 23: Backup Export Monthly CSV Streamed Successfully', t23Pass, `Content-Type: ${t23.headers['content-type']}`);

    // --- TEST 24: GET Backup Export Yearly JSON ---
    const t24 = await makeRequest('GET', '/api/owner/settings/backup/export?type=yearly', null, ownerAToken);
    const t24Pass = t24.status === 200 && t24.headers['content-type']?.includes('application/json');
    recordTest('Test 24: Backup Export Yearly JSON Streamed Successfully', t24Pass, `Content-Type: ${t24.headers['content-type']}`);

    // --- TEST 25: Invalid Backup Type Rejected ---
    const t25 = await makeRequest('GET', '/api/owner/settings/backup/export?type=invalid', null, ownerAToken);
    const t25Pass = t25.status === 400;
    recordTest('Test 25: Invalid Backup Export Type Rejected', t25Pass, `Status: ${t25.status}`);

    // --- TEST 26: Unauthenticated Request Returns 401 ---
    const t26 = await makeRequest('GET', '/api/owner/settings', null, null);
    const t26Pass = t26.status === 401;
    recordTest('Test 26: Unauthenticated Request Rejected with 401', t26Pass, `Status: ${t26.status}`);

    // --- TEST 27: Staff Role Request Returns 403 Forbidden ---
    const t27 = await makeRequest('GET', '/api/owner/settings', null, staffToken);
    const t27Pass = t27.status === 403;
    recordTest('Test 27: Non-Owner (STAFF) Access Blocked with 403', t27Pass, `Status: ${t27.status}`);

    // --- TEST 28: Multi-Tenant Isolation (Owner B receives Owner B Business data) ---
    const t28 = await makeRequest('GET', '/api/owner/settings', null, ownerBToken);
    const t28Pass = t28.status === 200 && t28.data?.data?.business?.name === 'Owner B Speed Wash';
    recordTest('Test 28: Multi-Tenant Isolation Verified for Owner B', t28Pass, `Business Name: ${t28.data?.data?.business?.name}`);

    // --- TEST 29: Query String businessId Override Blocked ---
    const t29 = await makeRequest('GET', `/api/owner/settings?businessId=${ownerBBusiness._id}`, null, ownerAToken);
    const t29Pass = t29.status === 200 && t29.data?.data?.business?.name === 'Owner A Premium Spa';
    recordTest('Test 29: Query String businessId Override Attempt Blocked', t29Pass, `Returned Owner A Business despite requesting Owner B ID`);

    // --- TEST 30: Body businessId Mass Assignment Override Blocked ---
    const t30 = await makeRequest('PATCH', '/api/owner/settings/profile', {
      companyName: 'Owner A Premium Spa',
      email: 'settings_owner_a@sparklepro.com',
      businessId: ownerBBusiness._id.toString(),
    }, ownerAToken);
    const t30Pass = t30.status === 200 && t30.data?.data?.business?.id === ownerABusiness._id.toString();
    recordTest('Test 30: Body businessId Mass Assignment Attempt Blocked', t30Pass, 'Target business document unchanged');

    // Summary
    const totalPassed = testResults.filter((t) => t.status === 'PASS').length;
    console.log('\n================================================================');
    console.log(` MODULE 7 SETTINGS TEST RESULTS SUMMARY: ${totalPassed} / ${testResults.length} PASSED`);
    console.log('================================================================\n');

    console.table(testResults);

    if (totalPassed !== testResults.length) {
      console.error('❌ Some Module 7 Settings tests failed!');
      process.exit(1);
    } else {
      console.log('🟢 ALL 30 MODULE 7 SETTINGS TESTS PASSED SUCCESSFULLY!\n');
    }
  } catch (err) {
    console.error('Fatal Error running test suite:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runSettingsTestSuite();
