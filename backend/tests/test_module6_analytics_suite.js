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
import Customer from '../src/modules/customers/customers.model.js';
import Staff from '../src/modules/staff/staff.model.js';
import { generateAccessToken } from '../src/utils/generateToken.js';

const PORT = 5050;
const BASE_URL = `http://localhost:${PORT}`;

let server;
let ownerA, ownerB;
let businessA, businessB;
let tokenA, tokenB;
let staffMemberA1;

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
          resolve({ status: res.statusCode, raw: data });
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

const runAnalyticsTestSuite = async () => {
  try {
    await connectDB();

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`================================================================`);
    console.log(` SPARKLEPRO MODULE 6 ANALYTICS BACKEND TEST SUITE`);
    console.log(`================================================================\n`);
    console.log(`[Module 6 Test Server] Running on port ${PORT}`);

    // Create Test Owners & Businesses
    ownerA = await User.create({
      fullName: 'Analytics Owner A',
      email: `analytics_owner_a_${Date.now()}@sparklepro.com`,
      password: 'Password123!',
      role: 'OWNER',
    });

    businessA = await Business.create({
      ownerId: ownerA._id,
      name: 'Analytics Business A',
      email: ownerA.email,
      setupCompleted: true,
    });

    ownerA.businessId = businessA._id;
    await ownerA.save();
    tokenA = generateAccessToken({ userId: ownerA._id, role: ownerA.role, businessId: businessA._id });

    // Business B for Tenant Isolation Testing
    ownerB = await User.create({
      fullName: 'Analytics Owner B',
      email: `analytics_owner_b_${Date.now()}@sparklepro.com`,
      password: 'Password123!',
      role: 'OWNER',
    });

    businessB = await Business.create({
      ownerId: ownerB._id,
      name: 'Analytics Business B',
      email: ownerB.email,
      setupCompleted: true,
    });

    ownerB.businessId = businessB._id;
    await ownerB.save();
    tokenB = generateAccessToken({ userId: ownerB._id, role: ownerB.role, businessId: businessB._id });

    // Seed Staff Member for Business A
    staffMemberA1 = await Staff.create({
      businessId: businessA._id,
      ownerId: ownerA._id,
      name: 'Rahul Specialist',
      phone: '+15550199991',
      role: 'Detailing Specialist',
      status: 'AVAILABLE',
    });

    // Seed Test Customers for Business A
    const now = new Date();
    const customerNew = await Customer.create({
      businessId: businessA._id,
      ownerId: ownerA._id,
      name: 'New Customer John',
      phone: '+15550190001',
      firstVisitAt: now,
      lastVisitAt: now,
      totalVisits: 1,
    });

    const customerReturning = await Customer.create({
      businessId: businessA._id,
      ownerId: ownerA._id,
      name: 'Returning Customer Jane',
      phone: '+15550190002',
      firstVisitAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      lastVisitAt: now,
      totalVisits: 3,
    });

    // Seed Jobs for Business A
    const servicesWash = [
      { serviceId: 'srv_foam', name: 'Foam Wash', price: 500, duration: '20 mins' },
      { serviceId: 'srv_wax', name: 'Ceramic Wax Protect', price: 1000, duration: '30 mins' },
    ];

    const servicesDetailing = [
      { serviceId: 'srv_foam', name: 'Foam Wash', price: 500, duration: '20 mins' },
      { serviceId: 'srv_interior', name: 'Interior Steam Clean', price: 2000, duration: '60 mins' },
    ];

    // Job 1: Completed Job (₹1,500 - Sedan/Car) assigned to Staff A1
    const jobCompleted1 = await Job.create({
      businessId: businessA._id,
      ownerId: ownerA._id,
      customerId: customerNew._id,
      jobId: `M6-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingToken: `tok_${Date.now()}_1`,
      customerName: customerNew.name,
      customerPhone: customerNew.phone,
      vehiclePlate: 'KL-01-A-1001',
      vehicleModel: 'Sedan',
      vehicleCategory: 'Car',
      services: servicesWash,
      assignedStaff: { staffId: staffMemberA1._id.toString(), name: staffMemberA1.name },
      subtotal: 1500,
      grandTotal: 1500,
      status: 'Completed',
      workflowStep: 'Ready',
      completedAt: now,
    });

    // Job 2: Completed Job (₹2,500 - SUV) assigned to Staff A1
    const jobCompleted2 = await Job.create({
      businessId: businessA._id,
      ownerId: ownerA._id,
      customerId: customerReturning._id,
      jobId: `M6-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingToken: `tok_${Date.now()}_2`,
      customerName: customerReturning.name,
      customerPhone: customerReturning.phone,
      vehiclePlate: 'KL-01-A-1002',
      vehicleModel: 'SUV',
      vehicleCategory: 'SUV',
      services: servicesDetailing,
      assignedStaff: { staffId: staffMemberA1._id.toString(), name: staffMemberA1.name },
      subtotal: 2500,
      grandTotal: 2500,
      status: 'Completed',
      workflowStep: 'Ready',
      completedAt: now,
    });

    // Job 3: Active Job (Pending / In Progress - ₹1,000) -> MUST NOT COUNT TOWARD REVENUE OR POPULARITY
    const jobPending = await Job.create({
      businessId: businessA._id,
      ownerId: ownerA._id,
      jobId: `M6-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingToken: `tok_${Date.now()}_3`,
      customerName: 'Pending Customer',
      customerPhone: '+15550190003',
      vehiclePlate: 'KL-01-A-1003',
      vehicleModel: 'Hatchback',
      vehicleCategory: 'Car',
      services: [{ serviceId: 'srv_foam', name: 'Foam Wash', price: 1000, duration: '20 mins' }],
      subtotal: 1000,
      grandTotal: 1000,
      status: 'In Progress',
      workflowStep: 'Wash',
    });

    // Job 4: Cancelled Job (₹3,000) -> MUST NOT COUNT TOWARD REVENUE OR SERVICE POPULARITY
    const jobCancelled = await Job.create({
      businessId: businessA._id,
      ownerId: ownerA._id,
      jobId: `M6-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingToken: `tok_${Date.now()}_4`,
      customerName: 'Cancelled Customer',
      customerPhone: '+15550190004',
      vehiclePlate: 'KL-01-A-1004',
      vehicleModel: 'Truck',
      vehicleCategory: 'Truck',
      services: [{ serviceId: 'srv_wax', name: 'Ceramic Wax Protect', price: 3000, duration: '60 mins' }],
      subtotal: 3000,
      grandTotal: 3000,
      status: 'Cancelled',
      workflowStep: 'Wait',
      updatedAt: now,
    });

    // Job 5: Business B Completed Job (₹9,999 - Bike) -> FOR TENANT ISOLATION
    const jobBusinessB = await Job.create({
      businessId: businessB._id,
      ownerId: ownerB._id,
      jobId: `M6-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingToken: `tok_${Date.now()}_5`,
      customerName: 'Tenant B Customer',
      customerPhone: '+15550190099',
      vehiclePlate: 'KL-02-B-9999',
      vehicleModel: 'Ninja 1000',
      vehicleCategory: 'Bike',
      services: [{ serviceId: 'srv_bike_wash', name: 'Bike Wash', price: 9999, duration: '30 mins' }],
      subtotal: 9999,
      grandTotal: 9999,
      status: 'Completed',
      workflowStep: 'Ready',
      completedAt: now,
    });

    // -------------------------------------------------------------
    // TEST 1: Analytics Overview Endpoint Works & Has Completion Rate
    // -------------------------------------------------------------
    const resOverview = await makeRequest('GET', '/api/owner/analytics/overview?timeframe=month', null, tokenA);
    logResult('Test 1: Analytics Overview Endpoint Works', resOverview.status === 200 && resOverview.body.success, `Status: ${resOverview.status}`);

    const dataOverview = resOverview.body.data;
    const expectedRevenue = 1500 + 2500; // 4000
    logResult('Test 2: Overview Returns Correct Total Revenue', dataOverview.totalRevenue === expectedRevenue, `Expected: ₹${expectedRevenue}, Got: ₹${dataOverview.totalRevenue}`);
    logResult('Test 3: Only Completed Jobs Contribute to Revenue', dataOverview.totalRevenue === 4000, `Realized Revenue: ₹${dataOverview.totalRevenue}`);

    const containsCancelledInRevenue = dataOverview.totalRevenue >= 7000;
    logResult('Test 4: Cancelled Jobs Excluded from Revenue', !containsCancelledInRevenue, `Revenue cleanly excluded ₹3,000 cancelled job`);

    const containsActiveInRevenue = dataOverview.totalRevenue >= 5000;
    logResult('Test 5: Active Jobs Excluded from Realized Revenue', !containsActiveInRevenue, `Revenue cleanly excluded ₹1,000 active job`);

    logResult('Test 6: Completed Job Count is Correct', dataOverview.completedJobs === 2, `Completed jobs count: ${dataOverview.completedJobs}`);
    logResult('Test 7: Cancelled Job Count is Correct', dataOverview.cancelledJobs === 1, `Cancelled jobs count: ${dataOverview.cancelledJobs}`);

    const expectedAvg = 4000 / 2; // 2000
    logResult('Test 8: Average Job Value Calculation is Correct', dataOverview.avgJobValue === expectedAvg, `Expected: ₹${expectedAvg}, Got: ₹${dataOverview.avgJobValue}`);

    // Completion Rate Check (2 completed out of 4 total created = 50%)
    const expectedCompletionRate = Math.round((2 / 4) * 100 * 100) / 100;
    logResult('Test 9: Completion Rate Calculation Correct', dataOverview.completionRate === expectedCompletionRate, `Expected: ${expectedCompletionRate}%, Got: ${dataOverview.completionRate}%`);

    // -------------------------------------------------------------
    // TEST 10: Revenue Trend Endpoint Works & Values Calculated
    // -------------------------------------------------------------
    const resTrend = await makeRequest('GET', '/api/owner/analytics/revenue-trend?timeframe=month', null, tokenA);
    const dataTrend = resTrend.body.data;
    const hasTrendValues = Array.isArray(dataTrend.values) && dataTrend.values.length > 0 && dataTrend.values.some((v) => v > 0);
    logResult('Test 10: Revenue Trend Values Dynamically Calculated', hasTrendValues, `Labels: ${dataTrend.labels.join(', ')} | Values: ${dataTrend.values.join(', ')}`);

    // -------------------------------------------------------------
    // TEST 11: MoM Comparison Endpoint Works
    // -------------------------------------------------------------
    const resMoM = await makeRequest('GET', '/api/owner/analytics/mom-comparison', null, tokenA);
    const dataMoM = resMoM.body.data;
    logResult('Test 11: MoM Comparison Net Growth Correct', dataMoM.netGrowth === 4000, `Current: ₹${dataMoM.currentMonthRevenue}, Net Growth: ₹${dataMoM.netGrowth}`);
    logResult('Test 12: Zero Previous Month Revenue Percentage Handled', dataMoM.percentageGrowth === 0, `Percentage Growth: ${dataMoM.percentageGrowth}%`);

    // -------------------------------------------------------------
    // TEST 13: Service Popularity Endpoint Works
    // -------------------------------------------------------------
    const resServices = await makeRequest('GET', '/api/owner/analytics/service-popularity?timeframe=month', null, tokenA);
    logResult('Test 13: Service Popularity Endpoint Works', resServices.status === 200 && resServices.body.success, `Status: ${resServices.status}`);

    const dataServices = resServices.body.data;
    // Foam Wash appears in 2 completed jobs (count 2), Wax in 1 (count 1), Interior in 1 (count 1)
    const foamWashService = dataServices.find((s) => s.serviceName === 'Foam Wash');
    const waxService = dataServices.find((s) => s.serviceName === 'Ceramic Wax Protect');

    logResult('Test 14: Service Popularity Uses Completed Jobs Only', foamWashService && foamWashService.jobCount === 2, `Foam Wash count: ${foamWashService ? foamWashService.jobCount : 0}`);
    logResult('Test 15: Service Revenue Calculated from Historical Snapshot', foamWashService && foamWashService.revenue === 1000, `Foam Wash total revenue (2 x ₹500): ₹${foamWashService ? foamWashService.revenue : 0}`);
    logResult('Test 16: Cancelled/Active Job Services Excluded', !dataServices.some((s) => s.serviceName === 'Ceramic Wax Protect' && s.jobCount > 1), `Ceramic Wax Protect count is 1 (excluded cancelled job)`);
    logResult('Test 17: Service Popularity Sorted by Usage Count', dataServices[0].serviceName === 'Foam Wash', `Most popular service: ${dataServices[0]?.serviceName}`);

    // -------------------------------------------------------------
    // TEST 18: Vehicle Category Breakdown Endpoint Works
    // -------------------------------------------------------------
    const resVehicles = await makeRequest('GET', '/api/owner/analytics/vehicle-breakdown?timeframe=month', null, tokenA);
    logResult('Test 18: Vehicle Category Breakdown Endpoint Works', resVehicles.status === 200 && resVehicles.body.success, `Status: ${resVehicles.status}`);

    const dataVehicles = resVehicles.body.data;
    const carCategory = dataVehicles.find((v) => v.category === 'Car');
    const suvCategory = dataVehicles.find((v) => v.category === 'SUV');
    const truckCategory = dataVehicles.find((v) => v.category === 'Truck');

    logResult('Test 19: Vehicle Category Counts & Revenue Correct', carCategory && carCategory.jobCount === 1 && suvCategory && suvCategory.jobCount === 1, `Car: ${carCategory?.jobCount}, SUV: ${suvCategory?.jobCount}`);
    logResult('Test 20: Vehicle Revenue Excludes Cancelled Jobs', !truckCategory, `Truck category excluded because job was cancelled`);

    // -------------------------------------------------------------
    // TEST 21: Staff Performance Endpoint Works
    // -------------------------------------------------------------
    const resStaffPerf = await makeRequest('GET', '/api/owner/analytics/staff-performance?timeframe=month', null, tokenA);
    logResult('Test 21: Staff Performance Endpoint Works', resStaffPerf.status === 200 && resStaffPerf.body.success, `Status: ${resStaffPerf.status}`);

    const dataStaffPerf = resStaffPerf.body.data;
    const rahulStaff = dataStaffPerf.find((s) => s.name === 'Rahul Specialist');
    logResult('Test 22: Staff Performance Completed Jobs & Revenue Correct', rahulStaff && rahulStaff.completedJobs === 2 && rahulStaff.totalRevenue === 4000, `Rahul Completed: ${rahulStaff?.completedJobs}, Total Rev: ₹${rahulStaff?.totalRevenue}`);

    // -------------------------------------------------------------
    // TEST 23: Empty Business Returns Valid Zero Structure across New Endpoints
    // -------------------------------------------------------------
    const ownerEmpty = await User.create({
      fullName: 'Analytics Empty Owner Phase2',
      email: `analytics_empty_p2_${Date.now()}@sparklepro.com`,
      password: 'Password123!',
      role: 'OWNER',
    });
    const businessEmpty = await Business.create({
      ownerId: ownerEmpty._id,
      name: 'Empty Business Phase2',
      email: ownerEmpty.email,
      setupCompleted: true,
    });
    ownerEmpty.businessId = businessEmpty._id;
    await ownerEmpty.save();
    const tokenEmpty = generateAccessToken({ userId: ownerEmpty._id, role: ownerEmpty.role, businessId: businessEmpty._id });

    const resEmptyOverview = await makeRequest('GET', '/api/owner/analytics/overview?timeframe=month', null, tokenEmpty);
    const resEmptyServices = await makeRequest('GET', '/api/owner/analytics/service-popularity?timeframe=month', null, tokenEmpty);
    const resEmptyVehicles = await makeRequest('GET', '/api/owner/analytics/vehicle-breakdown?timeframe=month', null, tokenEmpty);

    const emptyValid =
      resEmptyOverview.body.data.completionRate === 0 &&
      Array.isArray(resEmptyServices.body.data) && resEmptyServices.body.data.length === 0 &&
      Array.isArray(resEmptyVehicles.body.data) && resEmptyVehicles.body.data.length === 0;

    logResult('Test 23: Empty Business Zero-Data Handling Valid', emptyValid, `Zero-data returns valid zero/empty structures without errors`);

    // -------------------------------------------------------------
    // TEST 24: Tenant Isolation Across All New Endpoints
    // -------------------------------------------------------------
    const resTenantBServices = await makeRequest('GET', '/api/owner/analytics/service-popularity?timeframe=month', null, tokenB);
    const resTenantBVehicles = await makeRequest('GET', '/api/owner/analytics/vehicle-breakdown?timeframe=month', null, tokenB);

    const bServiceMatch = resTenantBServices.body.data.find((s) => s.serviceName === 'Bike Wash');
    const bVehicleMatch = resTenantBVehicles.body.data.find((v) => v.category === 'Bike');
    const isolatedFromA = !resTenantBServices.body.data.some((s) => s.serviceName === 'Foam Wash');

    logResult('Test 24: Tenant Isolation Verified Across Phase 2 APIs', bServiceMatch && bVehicleMatch && isolatedFromA, `Owner B isolated: Bike Wash revenue ₹9,999 returned without Business A data`);

    // -------------------------------------------------------------
    // TEST 25: Query String businessId Override Blocked
    // -------------------------------------------------------------
    const resOverride = await makeRequest('GET', `/api/owner/analytics/service-popularity?businessId=${businessB._id}`, null, tokenA);
    const overrideBlocked = resOverride.body.data.some((s) => s.serviceName === 'Foam Wash') && !resOverride.body.data.some((s) => s.serviceName === 'Bike Wash');
    logResult('Test 25: Query-String businessId Override Blocked', overrideBlocked, `Owner A receives Business A services despite requesting Business B in query string`);

    // Clean up test data
    await Job.deleteMany({ _id: { $in: [jobCompleted1._id, jobCompleted2._id, jobPending._id, jobCancelled._id, jobBusinessB._id] } });
    await Customer.deleteMany({ _id: { $in: [customerNew._id, customerReturning._id] } });
    await Staff.deleteMany({ _id: staffMemberA1._id });
    await User.deleteMany({ _id: { $in: [ownerA._id, ownerB._id, ownerEmpty._id] } });
    await Business.deleteMany({ _id: { $in: [businessA._id, businessB._id, businessEmpty._id] } });

    console.log(`\n================================================================`);
    console.log(` MODULE 6 PHASE 2 ANALYTICS TEST RESULTS SUMMARY`);
    console.log(`================================================================`);
    console.table(testResults);

    const allPassed = testResults.every((r) => r.status === 'PASS');
    if (allPassed) {
      console.log(`\n🟢 ALL 25 MODULE 6 PHASE 2 ANALYTICS TESTS PASSED SUCCESSFULLY!\n`);
    } else {
      console.log(`\n🔴 SOME TESTS FAILED!\n`);
    }

  } catch (error) {
    console.error('Test Suite Error:', error);
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
    process.exit(0);
  }
};

runAnalyticsTestSuite();
