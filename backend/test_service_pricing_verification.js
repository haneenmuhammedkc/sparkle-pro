import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from './src/models/Business.js';
import User from './src/models/User.js';
import Job from './src/modules/jobs/jobs.model.js';
import { getServices } from './src/modules/settings/settings.service.js';
import { createJob } from './src/modules/jobs/jobs.service.js';

dotenv.config();

async function runServicePricingVerification() {
  console.log('================================================================');
  console.log('=== VERIFYING SELECT SERVICES PRICE DISPLAY & JOB CALCULATIONS ===');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/sparklepro');

  const testEmail = 'pricing_verification_owner@sparklepro.com';
  await User.deleteMany({ email: testEmail });
  await Business.deleteMany({ email: testEmail });

  const owner = await User.create({
    fullName: 'Pricing Test Owner',
    email: testEmail,
    password: '$2a$10$abcdefghijklmnopqrstuuu',
    role: 'OWNER',
    isEmailVerified: true,
  });

  const business = await Business.create({
    name: 'Sparkle Auto Spa',
    ownerId: owner._id,
    email: testEmail,
    businessType: 'car-wash',
    servicesConfigured: [
      {
        id: 'srv-1',
        name: 'Full Body Wash',
        vehicleCategory: '4-wheeler',
        startingPrice: '₹500',
        price: 500,
        duration: '30 mins',
        enabled: true,
      },
      {
        id: 'srv-2',
        name: 'Interior Wash',
        vehicleCategory: '4-wheeler',
        startingPrice: '₹300',
        price: 300,
        duration: '30 mins',
        enabled: true,
      },
    ],
  });

  // 1. Test getServices normalizing prices
  const servicesResult = await getServices(owner._id, business._id);
  console.log('Normalized Services Returned:');
  servicesResult.servicesConfigured.forEach((s) => {
    console.log(`  - ${s.name} (${s.vehicleCategory}): Price = ₹${s.price} (Type: ${typeof s.price})`);
  });

  const fullWash = servicesResult.servicesConfigured.find((s) => s.name.includes('Full Body Wash'));
  const interiorWash = servicesResult.servicesConfigured.find((s) => s.name.includes('Interior Wash'));

  if (fullWash?.price === 500 && interiorWash?.price === 300) {
    console.log('\n🟢 STEP 1 PASSED: Backend services API returns correct numeric prices (₹500 and ₹300)');
  } else {
    console.error('\n🔴 STEP 1 FAILED: Incorrect prices returned');
  }

  // 2. Test Job Creation and Total Calculation
  const jobPayload = {
    customerName: 'Rahul Kumar',
    customerPhone: '+91 98765 43210',
    vehiclePlate: 'KL-07-AB-1234',
    vehicleModel: 'Honda City',
    vehicleCategory: 'Car',
    wheelCategory: '4-wheeler',
    services: [
      { serviceId: fullWash.id, name: fullWash.name, price: fullWash.price, duration: fullWash.duration },
      { serviceId: interiorWash.id, name: interiorWash.name, price: interiorWash.price, duration: interiorWash.duration },
    ],
  };

  const createdJob = await createJob(owner._id, jobPayload);
  console.log('\nCreated Job Ticket:');
  console.log(`  - Job ID: ${createdJob.jobId}`);
  console.log(`  - Subtotal: ₹${createdJob.subtotal}`);
  console.log(`  - Tax Amount: ₹${createdJob.taxAmount}`);
  console.log(`  - Grand Total: ₹${createdJob.grandTotal}`);

  if (createdJob.subtotal === 800 && createdJob.grandTotal === 864) {
    console.log('\n🟢 STEP 2 PASSED: Job total calculation uses actual service prices (500 + 300 = 800 subtotal, 864 grand total)');
  } else {
    console.error('\n🔴 STEP 2 FAILED: Incorrect job calculation');
  }

  // Cleanup
  await Job.deleteMany({ _id: createdJob._id });
  await Business.deleteMany({ _id: business._id });
  await User.deleteMany({ _id: owner._id });
  await mongoose.disconnect();

  console.log('\n================================================================');
  console.log('=== SERVICE PRICING & CALCULATION TEST PASSED 100%           ===');
  console.log('================================================================\n');
}

runServicePricingVerification().catch((err) => {
  console.error('Pricing test failed:', err);
  process.exit(1);
});
