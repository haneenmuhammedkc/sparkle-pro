import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Business from '../src/models/Business.js';
import Job from '../src/modules/jobs/jobs.model.js';
import Staff from '../src/modules/staff/staff.model.js';
import Customer from '../src/modules/customers/customers.model.js';
import { generateAccessToken } from '../src/utils/generateToken.js';

const PORT = 5045;
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
  console.log(' SPARKLEPRO MODULE 5 PHASE 2 — STAFF ↔ JOB INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`[Phase 2 Test Server] Running on port ${PORT}\n`);
    });

    // Cleanup test records
    await User.deleteMany({ email: { $in: ['p2_owner_a@sparklepro.com', 'p2_owner_b@sparklepro.com'] } });
    await Business.deleteMany({ name: { $in: ['P2 Staff Wash A', 'P2 Staff Wash B'] } });
    await Staff.deleteMany({ name: { $regex: /P2-Staff/i } });
    await Customer.deleteMany({ name: { $regex: /P2-Cust/i } });
    await Job.deleteMany({ vehiclePlate: { $regex: /P2-PLATE/i } });

    // Setup Owner A & Business A
    ownerA = new User({
      fullName: 'P2 Owner A',
      email: 'p2_owner_a@sparklepro.com',
      password: 'password123',
      role: 'OWNER',
      isEmailVerified: true,
    });
    await ownerA.save();

    businessA = new Business({
      ownerId: ownerA._id,
      name: 'P2 Staff Wash A',
      email: 'p2_wash_a@sparklepro.com',
      address: '101 P2 Way',
      phone: '+15551010000',
      categoryPricing: {
        Car: [{ _id: new mongoose.Types.ObjectId(), name: 'Supreme Detailing', price: 750 }],
      },
      isSetupComplete: true,
    });
    await businessA.save();
    ownerA.businessId = businessA._id;
    await ownerA.save();
    tokenA = generateAccessToken({ userId: ownerA._id, role: ownerA.role, businessId: ownerA.businessId });

    // Setup Owner B & Business B
    ownerB = new User({
      fullName: 'P2 Owner B',
      email: 'p2_owner_b@sparklepro.com',
      password: 'password123',
      role: 'OWNER',
      isEmailVerified: true,
    });
    await ownerB.save();

    businessB = new Business({
      ownerId: ownerB._id,
      name: 'P2 Staff Wash B',
      email: 'p2_wash_b@sparklepro.com',
      address: '202 P2 Way',
      phone: '+15552020000',
      isSetupComplete: true,
    });
    await businessB.save();
    ownerB.businessId = businessB._id;
    await ownerB.save();
    tokenB = generateAccessToken({ userId: ownerB._id, role: ownerB.role, businessId: ownerB.businessId });

    // Create Staff Members for Business A
    const staffA1 = new Staff({
      businessId: businessA._id,
      ownerId: ownerA._id,
      name: 'P2-Staff Rahul',
      phone: '+15551112222',
      role: 'Detailing Specialist',
      status: 'AVAILABLE',
      avatar: 'https://example.com/rahul.jpg',
    });
    await staffA1.save();

    const staffA2 = new Staff({
      businessId: businessA._id,
      ownerId: ownerA._id,
      name: 'P2-Staff Offline Tech',
      phone: '+15551113333',
      role: 'Wash Operator',
      status: 'OFFLINE',
    });
    await staffA2.save();

    // Create Staff Member for Business B (Cross-Tenant Security Test)
    const staffB1 = new Staff({
      businessId: businessB._id,
      ownerId: ownerB._id,
      name: 'P2-Staff Owner B Tech',
      phone: '+15552224444',
      role: 'Supervisor',
      status: 'AVAILABLE',
    });
    await staffB1.save();

    let createdJobId;

    // Test 1: Job Creation with Valid Staff ID
    const res1 = await makeRequest(
      'POST',
      '/api/owner/jobs',
      {
        customerName: 'P2-Cust Mark',
        customerPhone: '+1 (555) 777-1111',
        vehiclePlate: 'P2-PLATE-01',
        vehicleModel: 'BMW M3',
        selectedServices: ['Supreme Detailing'],
        assignedStaff: {
          staffId: staffA1._id.toString(),
          name: 'Spoofed Client Name',
        },
      },
      tokenA
    );
    if (res1.status === 201 && res1.body.success && res1.body.data._id) {
      createdJobId = res1.body.data._id;
      logResult('Test 1: Job Creation with Valid Staff ID', true, `Job ID: ${res1.body.data.jobId}`);
    } else {
      logResult('Test 1: Job Creation with Valid Staff ID', false, `Status: ${res1.status}`);
    }

    // Test 2: Job Stores Real Staff._id
    const dbJob1 = await Job.findById(createdJobId);
    if (dbJob1 && dbJob1.assignedStaff && dbJob1.assignedStaff.staffId === staffA1._id.toString()) {
      logResult('Test 2: Job Stores Real Staff._id', true, `Stored staffId: ${dbJob1.assignedStaff.staffId}`);
    } else {
      logResult('Test 2: Job Stores Real Staff._id', false, `Got: ${dbJob1?.assignedStaff?.staffId}`);
    }

    // Test 3: Job Stores Authoritative Staff Name (Not Client Spoofed Name)
    if (dbJob1 && dbJob1.assignedStaff && dbJob1.assignedStaff.name === 'P2-Staff Rahul') {
      logResult('Test 3: Authoritative Staff Name Stored', true, `Name: ${dbJob1.assignedStaff.name}`);
    } else {
      logResult('Test 3: Authoritative Staff Name Stored', false, `Got: ${dbJob1?.assignedStaff?.name}`);
    }

    // Test 4: Job Stores Authoritative Staff Avatar
    if (dbJob1 && dbJob1.assignedStaff && dbJob1.assignedStaff.avatar === 'https://example.com/rahul.jpg') {
      logResult('Test 4: Authoritative Staff Avatar Stored', true, `Avatar: ${dbJob1.assignedStaff.avatar}`);
    } else {
      logResult('Test 4: Authoritative Staff Avatar Stored', false, `Got: ${dbJob1?.assignedStaff?.avatar}`);
    }

    // Test 5: Job Creation without Staff (assignedStaff: null)
    const res5 = await makeRequest(
      'POST',
      '/api/owner/jobs',
      {
        customerName: 'P2-Cust Unassigned',
        customerPhone: '+1 (555) 777-2222',
        vehiclePlate: 'P2-PLATE-02',
        vehicleModel: 'Audi A4',
        selectedServices: ['Supreme Detailing'],
        assignedStaff: null,
      },
      tokenA
    );
    if (res5.status === 201 && res5.body.data.assignedStaff === null) {
      logResult('Test 5: Job Creation without Staff', true, 'assignedStaff is null as expected');
    } else {
      logResult('Test 5: Job Creation without Staff', false, `Status: ${res5.status}`);
    }

    // Test 6: Invalid Staff ID Rejected (404/400)
    const res6 = await makeRequest(
      'POST',
      '/api/owner/jobs',
      {
        customerName: 'P2-Cust InvalidStaff',
        customerPhone: '+1 (555) 777-3333',
        vehiclePlate: 'P2-PLATE-03',
        vehicleModel: 'Civic',
        selectedServices: ['Supreme Detailing'],
        assignedStaff: { staffId: new mongoose.Types.ObjectId().toString() },
      },
      tokenA
    );
    if (res6.status === 404 || res6.status === 400) {
      logResult('Test 6: Non-Existent Staff ID Rejected', true, `Status ${res6.status} returned`);
    } else {
      logResult('Test 6: Non-Existent Staff ID Rejected', false, `Status: ${res6.status}`);
    }

    // Test 7: Cross-Tenant Staff Assignment Rejected (Owner A using Owner B Staff)
    const res7 = await makeRequest(
      'POST',
      '/api/owner/jobs',
      {
        customerName: 'P2-Cust CrossTenant',
        customerPhone: '+1 (555) 777-4444',
        vehiclePlate: 'P2-PLATE-04',
        vehicleModel: 'Merc C300',
        selectedServices: ['Supreme Detailing'],
        assignedStaff: { staffId: staffB1._id.toString() },
      },
      tokenA
    );
    if (res7.status === 404 || res7.status === 400) {
      logResult('Test 7: Cross-Tenant Staff Assignment Rejected', true, `Blocked cross-tenant staff ID (Status ${res7.status})`);
    } else {
      logResult('Test 7: Cross-Tenant Staff Assignment Rejected', false, `Status: ${res7.status}`);
    }

    // Test 8: OFFLINE Staff Member Assignment Rejected
    const res8 = await makeRequest(
      'POST',
      '/api/owner/jobs',
      {
        customerName: 'P2-Cust OfflineTest',
        customerPhone: '+1 (555) 777-5555',
        vehiclePlate: 'P2-PLATE-05',
        vehicleModel: 'Porsche Macan',
        selectedServices: ['Supreme Detailing'],
        assignedStaff: { staffId: staffA2._id.toString() },
      },
      tokenA
    );
    if (res8.status === 400) {
      logResult('Test 8: OFFLINE Staff Member Assignment Rejected', true, 'Rejected assigning OFFLINE staff member');
    } else {
      logResult('Test 8: OFFLINE Staff Member Assignment Rejected', false, `Status: ${res8.status}`);
    }

    // Test 9: Staff Reassignment Endpoint (PATCH /api/owner/jobs/:id/assign)
    const newStaffA = new Staff({
      businessId: businessA._id,
      ownerId: ownerA._id,
      name: 'P2-Staff Ajmal',
      phone: '+15551114444',
      role: 'Car Wash Operator',
      status: 'AVAILABLE',
      avatar: 'https://example.com/ajmal.jpg',
    });
    await newStaffA.save();

    const res9 = await makeRequest(
      'PATCH',
      `/api/owner/jobs/${createdJobId}/assign`,
      { staffId: newStaffA._id.toString() },
      tokenA
    );
    if (res9.status === 200 && res9.body.data.assignedStaff.name === 'P2-Staff Ajmal') {
      logResult('Test 9: Staff Reassignment Endpoint (PATCH)', true, 'Reassigned job to P2-Staff Ajmal');
    } else {
      logResult('Test 9: Staff Reassignment Endpoint (PATCH)', false, `Status: ${res9.status}`);
    }

    // Test 10: Reassignment to another Tenant Staff Rejected
    const res10 = await makeRequest(
      'PATCH',
      `/api/owner/jobs/${createdJobId}/assign`,
      { staffId: staffB1._id.toString() },
      tokenA
    );
    if (res10.status === 404 || res10.status === 400) {
      logResult('Test 10: Reassignment to Tenant B Staff Rejected', true, 'Blocked cross-tenant reassignment');
    } else {
      logResult('Test 10: Reassignment to Tenant B Staff Rejected', false, `Status: ${res10.status}`);
    }

    // Test 11: Reassignment of Non-Existent Job returns 404
    const res11 = await makeRequest(
      'PATCH',
      `/api/owner/jobs/${new mongoose.Types.ObjectId()}/assign`,
      { staffId: newStaffA._id.toString() },
      tokenA
    );
    if (res11.status === 404) {
      logResult('Test 11: Reassignment of Non-Existent Job', true, '404 Not Found returned');
    } else {
      logResult('Test 11: Reassignment of Non-Existent Job', false, `Status: ${res11.status}`);
    }

    // Test 12: Historical Snapshot Intact after Staff Profile Update
    newStaffA.name = 'P2-Staff Ajmal Renamed';
    await newStaffA.save();

    const dbJobAfterRename = await Job.findById(createdJobId);
    if (dbJobAfterRename && dbJobAfterRename.assignedStaff.name === 'P2-Staff Ajmal') {
      logResult('Test 12: Historical Snapshot Preserved after Staff Rename', true, `Job snapshot preserved original name: "${dbJobAfterRename.assignedStaff.name}"`);
    } else {
      logResult('Test 12: Historical Snapshot Preserved after Staff Rename', false, `Got: ${dbJobAfterRename?.assignedStaff?.name}`);
    }

    // Test 13: Customer Link & Auto-Upsert Integration Functional
    if (dbJob1.customerId) {
      logResult('Test 13: Customer Auto-Upsert Functional alongside Staff', true, `Linked customerId: ${dbJob1.customerId}`);
    } else {
      logResult('Test 13: Customer Auto-Upsert Functional alongside Staff', false, 'Missing customerId');
    }

    // Test 14: Unassign Staff (staffId: null)
    const res14 = await makeRequest(
      'PATCH',
      `/api/owner/jobs/${createdJobId}/assign`,
      { staffId: null },
      tokenA
    );
    if (res14.status === 200 && res14.body.data.assignedStaff === null) {
      logResult('Test 14: Unassign Staff (staffId: null)', true, 'Successfully unassigned staff member');
    } else {
      logResult('Test 14: Unassign Staff (staffId: null)', false, `Status: ${res14.status}`);
    }
  } catch (err) {
    console.error('Phase 2 Integration Test Suite Error:', err);
  } finally {
    // Cleanup test records
    await User.deleteMany({ email: { $in: ['p2_owner_a@sparklepro.com', 'p2_owner_b@sparklepro.com'] } });
    await Business.deleteMany({ name: { $in: ['P2 Staff Wash A', 'P2 Staff Wash B'] } });
    await Staff.deleteMany({ name: { $regex: /P2-Staff/i } });
    await Customer.deleteMany({ name: { $regex: /P2-Cust/i } });
    await Job.deleteMany({ vehiclePlate: { $regex: /P2-PLATE/i } });

    if (server) server.close();
    await mongoose.connection.close();

    console.log('\n================================================================');
    console.log(' MODULE 5 PHASE 2 INTEGRATION TEST RESULTS SUMMARY');
    console.log('================================================================');
    console.table(testResults.map((r) => ({ Test: r.testName, Status: r.status })));
    process.exit(0);
  }
};

runTestSuite();
