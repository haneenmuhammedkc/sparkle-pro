import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Business from '../src/models/Business.js';
import Job from '../src/modules/jobs/jobs.model.js';
import Staff from '../src/modules/staff/staff.model.js';
import { generateAccessToken } from '../src/utils/generateToken.js';

const PORT = 5040;
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
  console.log(' SPARKLEPRO MODULE 5 STAFF MANAGEMENT BACKEND TEST SUITE');
  console.log('================================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`[Module 5 Test Server] Running on port ${PORT}\n`);
    });

    // Cleanup test records
    await User.deleteMany({ email: { $in: ['staff_owner_a@sparklepro.com', 'staff_owner_b@sparklepro.com'] } });
    await Business.deleteMany({ name: { $in: ['Sparkle Staff Wash A', 'Sparkle Staff Wash B'] } });
    await Staff.deleteMany({ name: { $regex: /StaffTest|Mike|Dave|Ana/i } });
    await Job.deleteMany({ vehiclePlate: { $regex: /ST-PLATE/i } });

    // Setup Owner A & Business A
    ownerA = new User({
      fullName: 'Staff Owner A',
      email: 'staff_owner_a@sparklepro.com',
      password: 'password123',
      role: 'OWNER',
      isEmailVerified: true,
    });
    await ownerA.save();

    businessA = new Business({
      ownerId: ownerA._id,
      name: 'Sparkle Staff Wash A',
      email: 'staff_wash_a@sparklepro.com',
      address: '555 Staff Way',
      phone: '+15555551111',
      categoryPricing: {
        Car: [{ _id: new mongoose.Types.ObjectId(), name: 'Full Detail Wash', price: 600 }],
      },
      isSetupComplete: true,
    });
    await businessA.save();
    ownerA.businessId = businessA._id;
    await ownerA.save();
    tokenA = generateAccessToken({ userId: ownerA._id, role: ownerA.role, businessId: ownerA.businessId });

    // Setup Owner B & Business B (for IDOR testing)
    ownerB = new User({
      fullName: 'Staff Owner B',
      email: 'staff_owner_b@sparklepro.com',
      password: 'password123',
      role: 'OWNER',
      isEmailVerified: true,
    });
    await ownerB.save();

    businessB = new Business({
      ownerId: ownerB._id,
      name: 'Sparkle Staff Wash B',
      email: 'staff_wash_b@sparklepro.com',
      address: '666 Staff Way',
      phone: '+15555552222',
      isSetupComplete: true,
    });
    await businessB.save();
    ownerB.businessId = businessB._id;
    await ownerB.save();
    tokenB = generateAccessToken({ userId: ownerB._id, role: ownerB.role, businessId: ownerB.businessId });

    let staffA1, staffA2;

    // Test 1: Staff Creation
    const res1 = await makeRequest(
      'POST',
      '/api/owner/staff',
      {
        name: 'StaffTest Mike',
        phone: '+1 (555) 100-2000',
        email: 'mike.staff@test.com',
        role: 'Detailing Specialist',
        status: 'AVAILABLE',
        workingSince: '8:00 AM',
      },
      tokenA
    );
    if (res1.status === 201 && res1.body.success && res1.body.data._id) {
      staffA1 = res1.body.data;
      logResult('Test 1: Staff Creation', true, `Staff ID: ${staffA1._id}`);
    } else {
      logResult('Test 1: Staff Creation', false, `Status: ${res1.status}`);
    }

    // Test 2: Staff Retrieval (List)
    const res2 = await makeRequest('GET', '/api/owner/staff', null, tokenA);
    if (res2.status === 200 && res2.body.success && res2.body.data.staff.length >= 1) {
      logResult('Test 2: Staff Retrieval List', true, `Found ${res2.body.data.staff.length} staff member(s)`);
    } else {
      logResult('Test 2: Staff Retrieval List', false, `Status: ${res2.status}`);
    }

    // Test 3: Staff Update (Role & Status)
    const res3 = await makeRequest(
      'PUT',
      `/api/owner/staff/${staffA1._id}`,
      {
        role: 'Senior Detailing Specialist',
        status: 'BUSY',
      },
      tokenA
    );
    if (res3.status === 200 && res3.body.data.status === 'BUSY') {
      logResult('Test 3: Staff Update', true, 'Role and Status BUSY updated');
    } else {
      logResult('Test 3: Staff Update', false, `Status: ${res3.status}`);
    }

    // Test 4: Create Second Staff Member (AVAILABLE)
    const res4 = await makeRequest(
      'POST',
      '/api/owner/staff',
      {
        name: 'StaffTest Dave',
        phone: '+1 (555) 300-4000',
        role: 'Car Wash Operator',
        status: 'AVAILABLE',
      },
      tokenA
    );
    if (res4.status === 201) {
      staffA2 = res4.body.data;
      logResult('Test 4: Second Staff Creation', true, `Staff ID: ${staffA2._id}`);
    } else {
      logResult('Test 4: Second Staff Creation', false, `Status: ${res4.status}`);
    }

    // Test 5: Status Filter Query (?status=AVAILABLE)
    const res5 = await makeRequest('GET', '/api/owner/staff?status=AVAILABLE', null, tokenA);
    if (res5.status === 200 && res5.body.data.staff.length === 1 && res5.body.data.staff[0].name === 'StaffTest Dave') {
      logResult('Test 5: Status Filter Query (?status=AVAILABLE)', true, 'Returned 1 AVAILABLE staff member');
    } else {
      logResult('Test 5: Status Filter Query (?status=AVAILABLE)', false, `Count: ${res5.body.data?.staff?.length}`);
    }

    // Test 6: Search Query (by name/role)
    const res6 = await makeRequest('GET', '/api/owner/staff?search=Senior', null, tokenA);
    if (res6.status === 200 && res6.body.data.staff.length === 1) {
      logResult('Test 6: Staff Search Query', true, 'Found staff by role "Senior"');
    } else {
      logResult('Test 6: Staff Search Query', false, `Status: ${res6.status}`);
    }

    // Test 7: Pagination Parameters
    const res7 = await makeRequest('GET', '/api/owner/staff?page=1&limit=1', null, tokenA);
    if (res7.status === 200 && res7.body.data.totalPages === 2) {
      logResult('Test 7: Staff Pagination', true, 'Page 1 limit 1 -> totalPages: 2');
    } else {
      logResult('Test 7: Staff Pagination', false, `Status: ${res7.status}`);
    }

    // Test 8: Staff Overview Statistics
    const res8 = await makeRequest('GET', '/api/owner/staff/stats', null, tokenA);
    if (res8.status === 200 && res8.body.data.totalStaff === 2 && res8.body.data.availableStaff === 1) {
      logResult('Test 8: Staff Overview Statistics', true, `Total: ${res8.body.data.totalStaff}, Available: ${res8.body.data.availableStaff}`);
    } else {
      logResult('Test 8: Staff Overview Statistics', false, `Status: ${res8.status}`);
    }

    // Test 9: Workload Aggregation (Staff with Active Job)
    const activeJob = new Job({
      jobId: 'ST-PLATE-01',
      businessId: businessA._id,
      ownerId: ownerA._id,
      customerName: 'Customer Test',
      customerPhone: '+15559990000',
      vehiclePlate: 'ST-PLATE-01',
      vehicleModel: 'Camry',
      services: [{ name: 'Wash', price: 300 }],
      subtotal: 300,
      taxRate: 0.08,
      taxAmount: 24,
      grandTotal: 324,
      currency: 'Indian Rupee (₹)',
      status: 'In Progress',
      workflowStep: 'Wash',
      currentStepIndex: 1,
      trackingToken: 'tr_st_active_token',
      assignedStaff: {
        staffId: staffA1._id.toString(),
        name: staffA1.name,
        avatar: null,
      },
    });
    await activeJob.save();

    const res9 = await makeRequest('GET', `/api/owner/staff/${staffA1._id}`, null, tokenA);
    if (res9.status === 200 && res9.body.data.activeJobsCount === 1) {
      logResult('Test 9: Workload Aggregation (Active Job)', true, `Active jobs count: ${res9.body.data.activeJobsCount}`);
    } else {
      logResult('Test 9: Workload Aggregation (Active Job)', false, `Count: ${res9.body.data?.activeJobsCount}`);
    }

    // Test 10: Staff with Completed Job
    activeJob.status = 'Completed';
    activeJob.completedAt = new Date();
    await activeJob.save();

    const res10 = await makeRequest('GET', `/api/owner/staff/${staffA1._id}`, null, tokenA);
    if (res10.status === 200 && res10.body.data.completedJobsCount === 1) {
      logResult('Test 10: Staff with Completed Job', true, `Completed jobs count: ${res10.body.data.completedJobsCount}`);
    } else {
      logResult('Test 10: Staff with Completed Job', false, `Status: ${res10.status}`);
    }

    // Test 11: Duplicate Phone Prevention in same business
    const res11 = await makeRequest(
      'POST',
      '/api/owner/staff',
      {
        name: 'StaffTest Duplicate',
        phone: '+1 (555) 100-2000',
      },
      tokenA
    );
    if (res11.status === 409) {
      logResult('Test 11: Duplicate Phone Prevention', true, 'Rejected duplicate staff phone in same business');
    } else {
      logResult('Test 11: Duplicate Phone Prevention', false, `Status: ${res11.status}`);
    }

    // Test 12: Tenant Isolation (Same phone in Business B)
    const res12 = await makeRequest(
      'POST',
      '/api/owner/staff',
      {
        name: 'StaffTest Owner B',
        phone: '+1 (555) 100-2000',
      },
      tokenB
    );
    if (res12.status === 201) {
      logResult('Test 12: Tenant Isolation (Same Phone in Business B)', true, 'Allowed same phone for different business tenant');
    } else {
      logResult('Test 12: Tenant Isolation (Same Phone in Business B)', false, `Status: ${res12.status}`);
    }

    // Test 13: IDOR GET Protection
    const res13 = await makeRequest('GET', `/api/owner/staff/${staffA1._id}`, null, tokenB);
    if (res13.status === 404) {
      logResult('Test 13: IDOR GET Protection', true, '404 Access Denied for Owner B');
    } else {
      logResult('Test 13: IDOR GET Protection', false, `Status: ${res13.status}`);
    }

    // Test 14: IDOR PUT Protection
    const res14 = await makeRequest('PUT', `/api/owner/staff/${staffA1._id}`, { name: 'Hacked Staff' }, tokenB);
    if (res14.status === 404) {
      logResult('Test 14: IDOR PUT Protection', true, '404 Update Blocked for Owner B');
    } else {
      logResult('Test 14: IDOR PUT Protection', false, `Status: ${res14.status}`);
    }

    // Test 15: IDOR DELETE Protection
    const res15 = await makeRequest('DELETE', `/api/owner/staff/${staffA1._id}`, null, tokenB);
    if (res15.status === 404) {
      logResult('Test 15: IDOR DELETE Protection', true, '404 Delete Blocked for Owner B');
    } else {
      logResult('Test 15: IDOR DELETE Protection', false, `Status: ${res15.status}`);
    }

    // Test 16: Invalid Input Rejection (Missing Name/Phone)
    const res16 = await makeRequest('POST', '/api/owner/staff', { role: 'Technician' }, tokenA);
    if (res16.status === 400) {
      logResult('Test 16: Invalid Input Rejection', true, 'Rejected missing name/phone');
    } else {
      logResult('Test 16: Invalid Input Rejection', false, `Status: ${res16.status}`);
    }

    // Test 17: Status Transition to OFFLINE
    const res17 = await makeRequest('PUT', `/api/owner/staff/${staffA2._id}`, { status: 'OFFLINE' }, tokenA);
    if (res17.status === 200 && res17.body.data.status === 'OFFLINE') {
      logResult('Test 17: Status Transition to OFFLINE', true, 'Updated status to OFFLINE');
    } else {
      logResult('Test 17: Status Transition to OFFLINE', false, `Status: ${res17.status}`);
    }

    // Test 18: Staff Details with Zero Jobs
    const res18 = await makeRequest('GET', `/api/owner/staff/${staffA2._id}`, null, tokenA);
    if (res18.status === 200 && res18.body.data.activeJobsCount === 0 && res18.body.data.completedJobsCount === 0) {
      logResult('Test 18: Staff Details with Zero Jobs', true, 'Handled 0 active and 0 completed jobs');
    } else {
      logResult('Test 18: Staff Details with Zero Jobs', false, `Status: ${res18.status}`);
    }

    // Test 19: Authorized Staff Deletion
    const res19 = await makeRequest('DELETE', `/api/owner/staff/${staffA1._id}`, null, tokenA);
    if (res19.status === 200 && res19.body.success) {
      logResult('Test 19: Authorized Staff Deletion', true, 'Staff member deleted successfully');
    } else {
      logResult('Test 19: Authorized Staff Deletion', false, `Status: ${res19.status}`);
    }

    // Test 20: Confirm Staff Deletion in Database
    const dbDeletedStaff = await Staff.findById(staffA1._id);
    if (dbDeletedStaff === null) {
      logResult('Test 20: Confirm Staff Deletion in DB', true, 'Document removed from MongoDB');
    } else {
      logResult('Test 20: Confirm Staff Deletion in DB', false, 'Document still exists in DB');
    }
  } catch (err) {
    console.error('Test Suite Error:', err);
  } finally {
    // Cleanup test records
    await User.deleteMany({ email: { $in: ['staff_owner_a@sparklepro.com', 'staff_owner_b@sparklepro.com'] } });
    await Business.deleteMany({ name: { $in: ['Sparkle Staff Wash A', 'Sparkle Staff Wash B'] } });
    await Staff.deleteMany({ name: { $regex: /StaffTest|Mike|Dave|Ana/i } });
    await Job.deleteMany({ vehiclePlate: { $regex: /ST-PLATE/i } });

    if (server) server.close();
    await mongoose.connection.close();

    console.log('\n================================================================');
    console.log(' MODULE 5 TEST RESULTS SUMMARY');
    console.log('================================================================');
    console.table(testResults.map((r) => ({ Test: r.testName, Status: r.status })));
    process.exit(0);
  }
};

runTestSuite();
