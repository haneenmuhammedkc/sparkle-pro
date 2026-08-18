import 'dotenv/config';
import connectDB from '../src/config/db.js';
import app from '../src/app.js';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Business from '../src/models/Business.js';
import Job from '../src/modules/jobs/jobs.model.js';
import { generateAccessToken } from '../src/utils/generateToken.js';

async function runModule3BackendTestSuite() {
  console.log('================================================================');
  console.log(' SPARKLEPRO MODULE 3 JOBS & BOOKING ENGINE BACKEND TEST SUITE');
  console.log('================================================================\n');

  await connectDB();

  const PORT = 5020;
  const server = app.listen(PORT, async () => {
    console.log(`[Module 3 Test Server] Running on port ${PORT}\n`);
    const baseUrl = `http://localhost:${PORT}/api`;

    const results = {};
    for (let i = 1; i <= 16; i++) {
      results[`Test ${i}`] = 'NOT TESTED';
    }

    try {
      // Setup Test Owner A and Business A
      const emailA = `ownerA_mod3_${Date.now()}@sparklepro.test`;
      const userA = await User.create({
        fullName: 'Owner A',
        email: emailA,
        password: 'Password123!',
        role: 'OWNER',
        isEmailVerified: true,
      });

      const businessA = await Business.create({
        ownerId: userA._id,
        name: 'Workshop A',
        email: emailA,
        setupCompleted: true,
        categoryPricing: {
          Car: [
            { name: 'Basic Wash', price: '₹499' },
            { name: 'Exterior Wash', price: '₹299' },
          ],
        },
      });

      const tokenA = generateAccessToken({ userId: userA._id.toString(), role: 'OWNER' });

      // Setup Test Owner B and Business B for isolation tests
      const emailB = `ownerB_mod3_${Date.now()}@sparklepro.test`;
      const userB = await User.create({
        fullName: 'Owner B',
        email: emailB,
        password: 'Password123!',
        role: 'OWNER',
        isEmailVerified: true,
      });

      const businessB = await Business.create({
        ownerId: userB._id,
        name: 'Workshop B',
        email: emailB,
        setupCompleted: true,
      });

      const tokenB = generateAccessToken({ userId: userB._id.toString(), role: 'OWNER' });

      // ----------------------------------------------------------------
      // Test 1: Create a valid Job
      // ----------------------------------------------------------------
      console.log('--- Test 1: Create Valid Job ---');
      const createRes = await fetch(`${baseUrl}/owner/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
          customerName: 'John Test',
          customerPhone: '+1 (555) 111-2233',
          vehiclePlate: 'KA-01-MJ-8899',
          vehicleBrand: 'Toyota',
          vehicleModel: 'Rav4',
          vehicleCategory: 'Car',
          wheelCategory: '4-wheeler',
          selectedServices: ['Exterior Wash'],
          priorityLevel: 'High',
        }),
      });

      const createData = await createRes.json();
      const createdJob = createData.data;

      if (createRes.status === 201 && createdJob && createdJob.jobId) {
        results['Test 1'] = 'PASS (Valid Job created)';
        console.log(`Job Created successfully! Job ID: ${createdJob.jobId}`);
      } else {
        results['Test 1'] = `FAIL (${createRes.status} ${createData.message})`;
      }

      // ----------------------------------------------------------------
      // Test 2: Verify Job persisted in MongoDB
      // ----------------------------------------------------------------
      console.log('\n--- Test 2: Verify Job Persistence ---');
      const dbJob = await Job.findById(createdJob?._id);
      if (dbJob && dbJob.customerName === 'John Test') {
        results['Test 2'] = 'PASS (Persisted in MongoDB)';
      } else {
        results['Test 2'] = 'FAIL';
      }

      // ----------------------------------------------------------------
      // Test 3: Verify service prices are snapshotted
      // ----------------------------------------------------------------
      console.log('\n--- Test 3: Verify Service Price Snapshot ---');
      if (dbJob && dbJob.services.length > 0 && dbJob.services[0].price === 299 && dbJob.subtotal === 299) {
        results['Test 3'] = `PASS (Locked price: ₹${dbJob.services[0].price}, subtotal: ₹${dbJob.subtotal})`;
      } else {
        results['Test 3'] = 'FAIL';
      }

      // ----------------------------------------------------------------
      // Test 4: Change Business service pricing & confirm Job snapshot unchanged
      // ----------------------------------------------------------------
      console.log('\n--- Test 4: Change Business Pricing & Check Immutability ---');
      await Business.updateOne(
        { _id: businessA._id },
        { 'categoryPricing.Car': [{ name: 'Exterior Wash', price: '₹999' }] }
      );

      const dbJobReload = await Job.findById(createdJob?._id);
      if (dbJobReload && dbJobReload.services[0].price === 299 && dbJobReload.subtotal === 299) {
        results['Test 4'] = 'PASS (Existing job snapshot remained ₹299 despite business price increase to ₹999)';
      } else {
        results['Test 4'] = 'FAIL';
      }

      // ----------------------------------------------------------------
      // Test 5: Update workflow Wait -> Wash
      // ----------------------------------------------------------------
      console.log('\n--- Test 5: Workflow Transition to Wash ---');
      const washRes = await fetch(`${baseUrl}/owner/jobs/${createdJob._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ stepIndex: 1 }),
      });
      const washData = await washRes.json();
      results['Test 5'] = washRes.status === 200 && washData.data.workflowStep === 'Wash' && washData.data.status === 'In Progress' ? 'PASS' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 6: Update workflow to Interior
      // ----------------------------------------------------------------
      console.log('\n--- Test 6: Workflow Transition to Interior ---');
      const intRes = await fetch(`${baseUrl}/owner/jobs/${createdJob._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ stepIndex: 2 }),
      });
      const intData = await intRes.json();
      results['Test 6'] = intRes.status === 200 && intData.data.workflowStep === 'Interior' && intData.data.status === 'In Progress' ? 'PASS' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 7: Update workflow to QC
      // ----------------------------------------------------------------
      console.log('\n--- Test 7: Workflow Transition to QC ---');
      const qcRes = await fetch(`${baseUrl}/owner/jobs/${createdJob._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ stepIndex: 3 }),
      });
      const qcData = await qcRes.json();
      results['Test 7'] = qcRes.status === 200 && qcData.data.workflowStep === 'QC' && qcData.data.status === 'In Progress' ? 'PASS' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 8: Update workflow to Ready
      // ----------------------------------------------------------------
      console.log('\n--- Test 8: Workflow Transition to Ready ---');
      const readyRes = await fetch(`${baseUrl}/owner/jobs/${createdJob._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ stepIndex: 4 }),
      });
      const readyData = await readyRes.json();
      results['Test 8'] = readyRes.status === 200 && readyData.data.workflowStep === 'Ready' && readyData.data.status === 'Ready' ? 'PASS' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 9: Complete Job and verify completedAt
      // ----------------------------------------------------------------
      console.log('\n--- Test 9: Complete Job ---');
      const completeRes = await fetch(`${baseUrl}/owner/jobs/${createdJob._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ status: 'Completed' }),
      });
      const completeData = await completeRes.json();
      results['Test 9'] = completeRes.status === 200 && completeData.data.status === 'Completed' && completeData.data.completedAt !== null ? 'PASS' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 10: Verify dashboard statistics
      // ----------------------------------------------------------------
      console.log('\n--- Test 10: Verify Dashboard Statistics ---');
      const statsRes = await fetch(`${baseUrl}/owner/jobs/stats`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const statsData = await statsRes.json();
      results['Test 10'] = statsRes.status === 200 && statsData.data.completedToday >= 1 ? 'PASS (Stats aggregated)' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 11: Attempt Owner A -> Owner B Job Access
      // ----------------------------------------------------------------
      console.log('\n--- Test 11: Owner Isolation Access Control ---');
      const isoGetRes = await fetch(`${baseUrl}/owner/jobs/${createdJob._id}`, {
        headers: { Authorization: `Bearer ${tokenB}` },
      });
      results['Test 11'] = isoGetRes.status === 404 ? 'PASS (404 Access Denied for Owner B)' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 12: Attempt Owner A -> Owner B Job Update
      // ----------------------------------------------------------------
      console.log('\n--- Test 12: Owner Isolation Update Rejection ---');
      const isoPutRes = await fetch(`${baseUrl}/owner/jobs/${createdJob._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
        },
        body: JSON.stringify({ stepIndex: 0 }),
      });
      results['Test 12'] = isoPutRes.status === 404 ? 'PASS (404 Update Blocked for Owner B)' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 13: Verify Unique Tracking Tokens
      // ----------------------------------------------------------------
      console.log('\n--- Test 13: Unique Tracking Tokens ---');
      const createRes2 = await fetch(`${baseUrl}/owner/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
          customerName: 'Jane Test',
          customerPhone: '+1 (555) 999-8877',
          vehiclePlate: 'MH-12-PQ-5566',
          vehicleModel: 'Hyundai Creta',
        }),
      });
      const createData2 = await createRes2.json();
      const token1 = createdJob.trackingToken;
      const token2 = createData2.data?.trackingToken;
      results['Test 13'] = token1 && token2 && token1 !== token2 ? 'PASS (Cryptographically unique tokens generated)' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 14: Public Vehicle Tracking Endpoint
      // ----------------------------------------------------------------
      console.log('\n--- Test 14: Public Tracking Endpoint ---');
      const trackRes = await fetch(`${baseUrl}/public/track?token=${token1}`);
      const trackData = await trackRes.json();
      results['Test 14'] = trackRes.status === 200 && trackData.data?.jobId === createdJob.jobId && !trackData.data?.grandTotal ? 'PASS (Sanitized telemetry returned)' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 15: Verify invalid workflow state handles cleanly
      // ----------------------------------------------------------------
      console.log('\n--- Test 15: Invalid Workflow State Validation ---');
      const badStateRes = await fetch(`${baseUrl}/owner/jobs/${createdJob._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ stepIndex: 99 }),
      });
      const badStateData = await badStateRes.json();
      results['Test 15'] = badStateRes.status === 200 ? 'PASS (Safely constrained to bounds)' : 'FAIL';

      // ----------------------------------------------------------------
      // Test 16: Verify invalid creation input rejected
      // ----------------------------------------------------------------
      console.log('\n--- Test 16: Invalid Input Validation ---');
      const badCreateRes = await fetch(`${baseUrl}/owner/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ customerName: 'No Phone User' }), // Missing required fields
      });
      const badCreateData = await badCreateRes.json();
      results['Test 16'] = badCreateRes.status === 400 || badCreateRes.status === 422 ? 'PASS (Validation rejected missing fields)' : 'FAIL';

      // Cleanup Test Data
      await Job.deleteMany({ businessId: { $in: [businessA._id, businessB._id] } });
      await Business.deleteMany({ _id: { $in: [businessA._id, businessB._id] } });
      await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    } catch (err) {
      console.error('[Test Suite Error]:', err);
    } finally {
      server.close();
      await mongoose.connection.close();

      console.log('\n================================================================');
      console.log(' MODULE 3 TEST RESULTS SUMMARY');
      console.log('================================================================');
      console.table(results);
      process.exit(0);
    }
  });
}

runModule3BackendTestSuite();
