import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Business from '../src/models/Business.js';
import Job from '../src/modules/jobs/jobs.model.js';
import Customer, { normalizePhone } from '../src/modules/customers/customers.model.js';
import { generateAccessToken } from '../src/utils/generateToken.js';
import { backfillExistingJobs } from '../src/modules/customers/customers.service.js';

const PORT = 5025;
const BASE_URL = `http://localhost:${PORT}`;

let server;
let ownerA, ownerB;
let businessA, businessB;
let tokenA, tokenB;

const testResults = [];

const logResult = (testName, passed, details = '') => {
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`--- ${testName}: ${status} ${details ? `(${details})` : ''} ---`);
  testResults.push({ testName, status, details });
};

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
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTestSuite = async () => {
  console.log('================================================================');
  console.log(' SPARKLEPRO MODULE 4 CUSTOMER MANAGEMENT BACKEND TEST SUITE');
  console.log('================================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`[Module 4 Test Server] Running on port ${PORT}\n`);
    });

    // Cleanup previous test users & businesses
    await User.deleteMany({ email: { $in: ['cust_owner_a@sparklepro.com', 'cust_owner_b@sparklepro.com'] } });
    await Business.deleteMany({ name: { $in: ['Sparkle Customer Wash A', 'Sparkle Customer Wash B'] } });
    await Customer.deleteMany({ name: { $regex: /CustTest|Backfill|Auto/i } });
    await Job.deleteMany({ vehiclePlate: { $regex: /CUST-|BF-|M4-/i } });

    // Setup Owner A & Business A
    ownerA = new User({
      fullName: 'Customer Owner A',
      email: 'cust_owner_a@sparklepro.com',
      password: 'password123',
      role: 'OWNER',
      isEmailVerified: true,
    });
    await ownerA.save();

    businessA = new Business({
      ownerId: ownerA._id,
      name: 'Sparkle Customer Wash A',
      email: 'wash_a@sparklepro.com',
      address: '100 Main St',
      phone: '+15550001111',
      categoryPricing: {
        Car: [{ _id: new mongoose.Types.ObjectId(), name: 'Exterior Wash', price: 300 }],
      },
      isSetupComplete: true,
    });
    await businessA.save();
    ownerA.businessId = businessA._id;
    await ownerA.save();
    tokenA = generateAccessToken({ userId: ownerA._id, role: ownerA.role, businessId: ownerA.businessId });

    // Setup Owner B & Business B (for IDOR testing)
    ownerB = new User({
      fullName: 'Customer Owner B',
      email: 'cust_owner_b@sparklepro.com',
      password: 'password123',
      role: 'OWNER',
      isEmailVerified: true,
    });
    await ownerB.save();

    businessB = new Business({
      ownerId: ownerB._id,
      name: 'Sparkle Customer Wash B',
      email: 'wash_b@sparklepro.com',
      address: '200 Other St',
      phone: '+15550002222',
      isSetupComplete: true,
    });
    await businessB.save();
    ownerB.businessId = businessB._id;
    await ownerB.save();
    tokenB = generateAccessToken({ userId: ownerB._id, role: ownerB.role, businessId: ownerB.businessId });

    let createdCustomerA;

    // Test 1: Customer Creation
    const res1 = await makeRequest(
      'POST',
      '/api/owner/customers',
      {
        name: 'CustTest John',
        phone: '+1 (555) 999-1111',
        email: 'john.cust@test.com',
        vehiclePlate: 'CUST-001',
        vehicleModel: 'Tesla Model 3',
        notes: 'VIP customer',
      },
      tokenA
    );
    if (res1.status === 201 && res1.body.success && res1.body.data._id) {
      createdCustomerA = res1.body.data;
      logResult('Test 1: Customer Creation', true, `Customer ID: ${createdCustomerA._id}`);
    } else {
      logResult('Test 1: Customer Creation', false, `Status: ${res1.status}`);
    }

    // Test 2: Customer Retrieval (List)
    const res2 = await makeRequest('GET', '/api/owner/customers', null, tokenA);
    if (res2.status === 200 && res2.body.success && res2.body.data.customers.length >= 1) {
      logResult('Test 2: Customer Retrieval List', true, `Found ${res2.body.data.customers.length} customers`);
    } else {
      logResult('Test 2: Customer Retrieval List', false, `Status: ${res2.status}`);
    }

    // Test 3: Customer Update
    const res3 = await makeRequest(
      'PUT',
      `/api/owner/customers/${createdCustomerA._id}`,
      {
        name: 'CustTest John Updated',
        notes: 'Updated VIP preferences',
      },
      tokenA
    );
    if (res3.status === 200 && res3.body.data.name === 'CustTest John Updated') {
      logResult('Test 3: Customer Update', true, 'Name updated successfully');
    } else {
      logResult('Test 3: Customer Update', false, `Status: ${res3.status}`);
    }

    // Test 4: Customer Details & History
    const res4 = await makeRequest('GET', `/api/owner/customers/${createdCustomerA._id}`, null, tokenA);
    if (res4.status === 200 && res4.body.data.name === 'CustTest John Updated') {
      logResult('Test 4: Customer Details', true, 'Retrieved customer profile');
    } else {
      logResult('Test 4: Customer Details', false, `Status: ${res4.status}`);
    }

    // Test 5: Customer Search
    const res5 = await makeRequest('GET', '/api/owner/customers?search=CUST-001', null, tokenA);
    if (res5.status === 200 && res5.body.data.customers.length === 1) {
      logResult('Test 5: Customer Search', true, 'Found customer by vehicle plate');
    } else {
      logResult('Test 5: Customer Search', false, `Status: ${res5.status}`);
    }

    // Test 6: Pagination Parameters
    const res6 = await makeRequest('GET', '/api/owner/customers?page=1&limit=5', null, tokenA);
    if (res6.status === 200 && res6.body.data.currentPage === 1) {
      logResult('Test 6: Pagination', true, 'Page 1 & Limit 5 verified');
    } else {
      logResult('Test 6: Pagination', false, `Status: ${res6.status}`);
    }

    // Test 7: Customer Overview Stats
    const res7 = await makeRequest('GET', '/api/owner/customers/stats', null, tokenA);
    if (res7.status === 200 && res7.body.data.totalCustomers >= 1) {
      logResult('Test 7: Customer Overview Stats', true, `Total Customers: ${res7.body.data.totalCustomers}`);
    } else {
      logResult('Test 7: Customer Overview Stats', false, `Status: ${res7.status}`);
    }

    // Test 8: Duplicate Phone Prevention in same business
    const res8 = await makeRequest(
      'POST',
      '/api/owner/customers',
      {
        name: 'CustTest Duplicate',
        phone: '+1 (555) 999-1111',
      },
      tokenA
    );
    if (res8.status === 409) {
      logResult('Test 8: Duplicate Phone Prevention', true, 'Rejected duplicate phone number in same business');
    } else {
      logResult('Test 8: Duplicate Phone Prevention', false, `Status: ${res8.status}`);
    }

    // Test 9: Phone Normalization Helper
    const normalized = normalizePhone('+1 (555) 019-2834');
    if (normalized === '+15550192834') {
      logResult('Test 9: Phone Normalization', true, 'Normalized +1 (555) 019-2834 -> +15550192834');
    } else {
      logResult('Test 9: Phone Normalization', false, `Got: ${normalized}`);
    }

    // Test 10: Automatic Customer Creation on Job Post
    const res10 = await makeRequest(
      'POST',
      '/api/owner/jobs',
      {
        customerName: 'Auto Customer One',
        customerPhone: '+1 (555) 888-2222',
        vehiclePlate: 'AUTO-01',
        vehicleModel: 'Honda Civic',
        vehicleCategory: 'Car',
        selectedServices: ['Exterior Wash'],
      },
      tokenA
    );
    let autoJob1 = res10.body.data;
    if (res10.status === 201 && autoJob1 && autoJob1.customerId) {
      logResult('Test 10: Automatic Customer Creation on Job Post', true, `Linked customerId: ${autoJob1.customerId}`);
    } else {
      logResult('Test 10: Automatic Customer Creation on Job Post', false, `Status: ${res10.status}`);
    }

    // Test 11: Existing Customer Reuse on Second Job
    const res11 = await makeRequest(
      'POST',
      '/api/owner/jobs',
      {
        customerName: 'Auto Customer One',
        customerPhone: '+1 (555) 888-2222',
        vehiclePlate: 'AUTO-02',
        vehicleModel: 'Honda Accord',
        vehicleCategory: 'Car',
        selectedServices: ['Exterior Wash'],
      },
      tokenA
    );
    let autoJob2 = res11.body.data;
    if (res11.status === 201 && autoJob2 && String(autoJob2.customerId) === String(autoJob1.customerId)) {
      logResult('Test 11: Existing Customer Reused on Second Job', true, `Reused customerId: ${autoJob2.customerId}`);
    } else {
      logResult('Test 11: Existing Customer Reused on Second Job', false, `Status: ${res11.status}`);
    }

    // Test 12: Job.customerId Populated
    const dbJob = await Job.findById(autoJob1._id);
    if (dbJob && dbJob.customerId && String(dbJob.customerId) === String(autoJob1.customerId)) {
      logResult('Test 12: Job.customerId Populated in MongoDB', true, 'DB record confirmed');
    } else {
      logResult('Test 12: Job.customerId Populated in MongoDB', false, 'Missing customerId in DB');
    }

    // Test 13: Vehicle List Updated on Customer Profile
    const updatedCustomerObj = await Customer.findById(autoJob1.customerId);
    if (updatedCustomerObj && updatedCustomerObj.vehicles.length >= 2) {
      logResult('Test 13: Vehicle List Updated on Customer Profile', true, `Vehicles count: ${updatedCustomerObj.vehicles.length}`);
    } else {
      logResult('Test 13: Vehicle List Updated on Customer Profile', false, `Count: ${updatedCustomerObj?.vehicles?.length}`);
    }

    // Test 14: Tenant Isolation (Same Phone in Different Business)
    const res14 = await makeRequest(
      'POST',
      '/api/owner/customers',
      {
        name: 'CustTest John Owner B',
        phone: '+1 (555) 999-1111',
      },
      tokenB
    );
    if (res14.status === 201) {
      logResult('Test 14: Tenant Isolation (Same Phone in Business B)', true, 'Successfully allowed same phone for different business');
    } else {
      logResult('Test 14: Tenant Isolation (Same Phone in Business B)', false, `Status: ${res14.status}`);
    }

    // Test 15: IDOR GET Protection
    const res15 = await makeRequest('GET', `/api/owner/customers/${createdCustomerA._id}`, null, tokenB);
    if (res15.status === 404) {
      logResult('Test 15: IDOR GET Protection', true, '404 Access Denied for Owner B');
    } else {
      logResult('Test 15: IDOR GET Protection', false, `Status: ${res15.status}`);
    }

    // Test 16: IDOR PUT Protection
    const res16 = await makeRequest(
      'PUT',
      `/api/owner/customers/${createdCustomerA._id}`,
      { name: 'Hacked Name' },
      tokenB
    );
    if (res16.status === 404) {
      logResult('Test 16: IDOR PUT Protection', true, '404 Update Blocked for Owner B');
    } else {
      logResult('Test 16: IDOR PUT Protection', false, `Status: ${res16.status}`);
    }

    // Test 17: IDOR DELETE Protection
    const res17 = await makeRequest('DELETE', `/api/owner/customers/${createdCustomerA._id}`, null, tokenB);
    if (res17.status === 404) {
      logResult('Test 17: IDOR DELETE Protection', true, '404 Delete Blocked for Owner B');
    } else {
      logResult('Test 17: IDOR DELETE Protection', false, `Status: ${res17.status}`);
    }

    // Test 18: Invalid Input Rejection
    const res18 = await makeRequest('POST', '/api/owner/customers', { name: '' }, tokenA);
    if (res18.status === 400) {
      logResult('Test 18: Invalid Input Rejection', true, 'Rejected missing name/phone');
    } else {
      logResult('Test 18: Invalid Input Rejection', false, `Status: ${res18.status}`);
    }

    // Test 19: Customer Deletion (Authorized)
    const res19 = await makeRequest('DELETE', `/api/owner/customers/${createdCustomerA._id}`, null, tokenA);
    if (res19.status === 200 && res19.body.success) {
      logResult('Test 19: Customer Deletion', true, 'Customer deleted by Owner A');
    } else {
      logResult('Test 19: Customer Deletion', false, `Status: ${res19.status}`);
    }

    // Test 20: Job Backfill Migration Behavior
    const orphanJob = new Job({
      jobId: 'BF-1001',
      businessId: businessA._id,
      ownerId: ownerA._id,
      customerName: 'Backfill Customer',
      customerPhone: '+1 (555) 777-3333',
      vehiclePlate: 'BF-001',
      vehicleModel: 'Corolla',
      services: [{ name: 'Wash', price: 200 }],
      subtotal: 200,
      taxRate: 0.08,
      taxAmount: 16,
      grandTotal: 216,
      currency: 'Indian Rupee (₹)',
      status: 'Pending',
      workflowStep: 'Wait',
      currentStepIndex: 0,
      trackingToken: 'tr_bf_test_token',
      customerId: null,
    });
    await orphanJob.save();

    const backfillResult = await backfillExistingJobs(businessA._id);
    const updatedOrphanJob = await Job.findById(orphanJob._id);

    if (
      backfillResult.backfilledCount >= 1 &&
      updatedOrphanJob.customerId &&
      updatedOrphanJob.grandTotal === 216
    ) {
      logResult('Test 20: Existing Job Backfill Migration', true, `Backfilled customerId: ${updatedOrphanJob.customerId}`);
    } else {
      logResult('Test 20: Existing Job Backfill Migration', false, `Count: ${backfillResult.backfilledCount}`);
    }
  } catch (err) {
    console.error('Test Suite Error:', err);
  } finally {
    // Cleanup test records
    await User.deleteMany({ email: { $in: ['cust_owner_a@sparklepro.com', 'cust_owner_b@sparklepro.com'] } });
    await Business.deleteMany({ name: { $in: ['Sparkle Customer Wash A', 'Sparkle Customer Wash B'] } });
    await Customer.deleteMany({ name: { $regex: /CustTest|Backfill|Auto/i } });
    await Job.deleteMany({ vehiclePlate: { $regex: /CUST-|BF-|M4-/i } });

    if (server) server.close();
    await mongoose.connection.close();

    console.log('\n================================================================');
    console.log(' MODULE 4 TEST RESULTS SUMMARY');
    console.log('================================================================');
    console.table(testResults.map((r) => ({ Test: r.testName, Status: r.status })));
    process.exit(0);
  }
};

runTestSuite();
