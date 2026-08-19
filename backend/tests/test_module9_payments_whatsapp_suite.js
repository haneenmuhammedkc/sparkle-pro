import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../src/config/db.js';
import app from '../src/app.js';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Business from '../src/models/Business.js';
import Job from '../src/modules/jobs/jobs.model.js';
import Customer from '../src/modules/customers/customers.model.js';
import Staff from '../src/modules/staff/staff.model.js';

let server;
const PORT = 5019;
const BASE_URL = `http://localhost:${PORT}`;

let ownerAToken, ownerBToken;
let ownerABusinessId, ownerBBusinessId;
let ownerAJobId, ownerAJobTrackingToken;

const runTests = async () => {
  console.log('================================================================');
  console.log(' MODULE 9: OWNER PAYMENT RECORDING & WHATSAPP SUITE');
  console.log('================================================================\n');

  try {
    await connectDB();
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`[Test Server] Running on port ${PORT}\n`);
        resolve();
      });
    });

    // Cleanup existing test documents
    await User.deleteMany({ email: { $in: ['pay_owner_a@sparklepro.com', 'pay_owner_b@sparklepro.com'] } });
    await Business.deleteMany({ name: { $in: ['Owner A Wash Hub', 'Owner B Speed Spa'] } });

    // 1. Setup Owner A
    const regResA = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Owner A Payment',
        email: 'pay_owner_a@sparklepro.com',
        password: 'Password123!',
      }),
    });
    const regDataA = await regResA.json();
    const ownerAUser = await User.findOne({ email: 'pay_owner_a@sparklepro.com' });
    ownerAUser.isEmailVerified = true;
    await ownerAUser.save();

    // Create Business A
    const bizA = await Business.create({
      ownerId: ownerAUser._id,
      name: 'Owner A Wash Hub',
      email: 'pay_owner_a@sparklepro.com',
      mobileNumber: '+919876543210',
      whatsappNumber: '+919876543210',
      address: '123 Main St, Bangalore',
      setupCompleted: true,
      servicesConfigured: [
        { name: 'Foam Wash', price: 1000, duration: '45m', enabled: true, vehicleCategory: '4-wheeler' },
      ],
    });
    ownerABusinessId = bizA._id;

    // Login Owner A
    const loginResA = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pay_owner_a@sparklepro.com',
        password: 'Password123!',
      }),
    });
    const loginDataA = await loginResA.json();
    ownerAToken = loginDataA.data.accessToken;

    // 2. Setup Owner B (Tenant Isolation Target)
    const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Owner B Payment',
        email: 'pay_owner_b@sparklepro.com',
        password: 'Password123!',
      }),
    });
    const ownerBUser = await User.findOne({ email: 'pay_owner_b@sparklepro.com' });
    ownerBUser.isEmailVerified = true;
    await ownerBUser.save();
    const bizB = await Business.create({
      ownerId: ownerBUser._id,
      name: 'Owner B Speed Spa',
      email: 'pay_owner_b@sparklepro.com',
      mobileNumber: '+919111122222',
      whatsappNumber: '+919111122222',
      address: '456 Commercial Rd, Mysore',
      setupCompleted: true,
    });
    ownerBBusinessId = bizB._id;

    const loginResB = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pay_owner_b@sparklepro.com',
        password: 'Password123!',
      }),
    });
    const loginDataB = await loginResB.json();
    ownerBToken = loginDataB.data.accessToken;

    const results = [];

    // Test 1: Create Job & Verify Initial Unpaid Payment State
    const createJobRes = await fetch(`${BASE_URL}/api/owner/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerAToken}`,
      },
      body: JSON.stringify({
        customerName: 'Rahul Kumar',
        customerPhone: '+919988776655',
        vehiclePlate: 'KA05AB1234',
        vehicleModel: 'Honda City',
        vehicleCategory: 'Car',
        wheelCategory: '4-wheeler',
        services: [
          { name: 'Foam Wash', price: 1000, duration: '45m' },
        ],
      }),
    });
    const createJobData = await createJobRes.json();
    if (!createJobData.data) {
      console.error('Create Job Failed:', createJobRes.status, createJobData);
    }
    ownerAJobId = createJobData.data?._id;
    ownerAJobTrackingToken = createJobData.data?.trackingToken;

    const initialJob = createJobData.data;
    const test1Passed =
      createJobRes.status === 201 &&
      initialJob.paymentStatus === 'UNPAID' &&
      initialJob.paidAmount === 0 &&
      initialJob.balanceAmount === initialJob.grandTotal;
    results.push({ testName: 'Test 1: Initial Job Payment State is UNPAID with zero paidAmount', status: test1Passed ? 'PASS' : 'FAIL' });

    // Test 2: Record Partial Payment (e.g. ₹500 on ₹1080 grand total)
    const partialRes = await fetch(`${BASE_URL}/api/owner/jobs/${ownerAJobId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerAToken}`,
      },
      body: JSON.stringify({
        paidAmount: 500,
        paymentMethod: 'UPI',
        transactionRef: 'UPI12345678',
      }),
    });
    const partialData = await partialRes.json();
    const test2Passed =
      partialRes.status === 200 &&
      partialData.data.paymentStatus === 'PARTIAL' &&
      partialData.data.paidAmount === 500 &&
      partialData.data.balanceAmount === Number((initialJob.grandTotal - 500).toFixed(2)) &&
      partialData.data.paymentMethod === 'UPI';
    results.push({ testName: 'Test 2: Partial Payment correctly updates status & balanceAmount', status: test2Passed ? 'PASS' : 'FAIL' });

    // Test 3: Record Complete Payment (Equal to grandTotal)
    const fullRes = await fetch(`${BASE_URL}/api/owner/jobs/${ownerAJobId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerAToken}`,
      },
      body: JSON.stringify({
        paidAmount: initialJob.grandTotal,
        paymentMethod: 'CARD',
        transactionRef: 'CARD999',
      }),
    });
    const fullData = await fullRes.json();
    const test3Passed =
      fullRes.status === 200 &&
      fullData.data.paymentStatus === 'PAID' &&
      fullData.data.paidAmount === initialJob.grandTotal &&
      fullData.data.balanceAmount === 0 &&
      fullData.data.paymentMethod === 'CARD';
    results.push({ testName: 'Test 4: Complete Payment updates status to PAID with zero balanceAmount', status: test3Passed ? 'PASS' : 'FAIL' });

    // Test 4: Reject Negative Paid Amount (< 0)
    const negRes = await fetch(`${BASE_URL}/api/owner/jobs/${ownerAJobId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerAToken}`,
      },
      body: JSON.stringify({ paidAmount: -100, paymentMethod: 'CASH' }),
    });
    results.push({ testName: 'Test 5: Negative paidAmount rejected with HTTP 400', status: negRes.status === 400 ? 'PASS' : 'FAIL' });

    // Test 5: Reject Overpayment (> grandTotal)
    const overRes = await fetch(`${BASE_URL}/api/owner/jobs/${ownerAJobId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerAToken}`,
      },
      body: JSON.stringify({ paidAmount: initialJob.grandTotal + 500, paymentMethod: 'CASH' }),
    });
    results.push({ testName: 'Test 6: Overpayment exceeding grandTotal rejected with HTTP 400', status: overRes.status === 400 ? 'PASS' : 'FAIL' });

    // Test 6: Reject Invalid Payment Method
    const invalidMethodRes = await fetch(`${BASE_URL}/api/owner/jobs/${ownerAJobId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerAToken}`,
      },
      body: JSON.stringify({ paidAmount: 100, paymentMethod: 'BITCOIN' }),
    });
    results.push({ testName: 'Test 7: Invalid paymentMethod rejected with HTTP 400', status: invalidMethodRes.status === 400 ? 'PASS' : 'FAIL' });

    // Test 7: Multi-Tenant IDOR Protection (Owner B cannot update Owner A job payment)
    const idorRes = await fetch(`${BASE_URL}/api/owner/jobs/${ownerAJobId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerBToken}`,
      },
      body: JSON.stringify({ paidAmount: 0, paymentMethod: 'CASH' }),
    });
    results.push({ testName: 'Test 8: Tenant Isolation - Owner B payment update on Owner A job blocked (HTTP 404)', status: idorRes.status === 404 ? 'PASS' : 'FAIL' });

    // Test 8: WhatsApp Tracking URL & Public Telemetry Verification
    const publicTrackRes = await fetch(`${BASE_URL}/api/public/track?token=${ownerAJobTrackingToken}`);
    const publicTrackData = await publicTrackRes.json();

    const test8Passed =
      publicTrackRes.status === 200 &&
      publicTrackData.data.grandTotal === initialJob.grandTotal &&
      publicTrackData.data.customerPhoneMasked &&
      publicTrackData.data.customerPhoneMasked.endsWith('6655') &&
      publicTrackData.data.customerPhoneMasked.includes('*') &&
      !publicTrackData.data.ownerId &&
      !publicTrackData.data.businessId;
    results.push({ testName: 'Test 9: WhatsApp tracking telemetry contains clean public data without credential leakage', status: test8Passed ? 'PASS' : 'FAIL' });

    // Test 9: Aggregated Dashboard Job Stats Payment Metrics
    const statsRes = await fetch(`${BASE_URL}/api/owner/jobs/stats`, {
      headers: { Authorization: `Bearer ${ownerAToken}` },
    });
    const statsData = await statsRes.json();
    const test9Passed =
      statsRes.status === 200 &&
      statsData.data &&
      statsData.data.payments &&
      statsData.data.payments.totalRevenue > 0 &&
      statsData.data.payments.paidCount >= 1;
    results.push({ testName: 'Test 10: Dashboard statistics aggregate payment metrics correctly', status: test9Passed ? 'PASS' : 'FAIL' });

    console.table(results);
    console.log('\n🟢 ALL MODULE 9 TESTS EXECUTED SUCCESSFULLY!');

  } catch (err) {
    console.error('Module 9 Test Failure:', err);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
};

runTests();
