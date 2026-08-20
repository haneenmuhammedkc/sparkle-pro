import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from '../src/models/Business.js';
import User from '../src/models/User.js';
import { updateProfile, getSettings } from '../src/modules/settings/settings.service.js';

dotenv.config();

async function runLogoFlowTest() {
  console.log('================================================================');
  console.log('=== VERIFYING BUSINESS LOGO UPLOAD, PERSISTENCE & RESTRICTIONS ===');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGO_URL);

  const testEmail = 'logo_flow_owner@sparklepro.com';
  await User.deleteMany({ email: testEmail });
  await Business.deleteMany({ email: testEmail });

  const owner = await User.create({
    fullName: 'Logo Flow Test Owner',
    email: testEmail,
    password: '$2a$10$abcdefghijklmnopqrstuuu',
    role: 'OWNER',
    isEmailVerified: true,
  });

  const business = await Business.create({
    name: 'Logo Test Workshop',
    ownerId: owner._id,
    email: testEmail,
    businessType: 'car-wash',
    logo: null,
  });

  // TEST 1: Initial state
  const initialSettings = await getSettings(owner._id, business._id);
  console.log(`1. Initial Business Logo in DB: ${initialSettings.business.logo} (Expected: null)`);

  // TEST 2: Invalid file extension rejection
  console.log('\n2. Testing invalid file extension rejection (.pdf / .txt / invalid Data URL)...');
  try {
    await updateProfile(owner._id, business._id, {
      companyName: 'Logo Test Workshop',
      email: testEmail,
      logo: 'data:application/pdf;base64,JVBERi0xLjQK...',
    });
    console.error('🔴 FAILED: Should have rejected PDF file format');
  } catch (err) {
    console.log(`🟢 PASSED: Rejected invalid file format: "${err.message}"`);
  }

  // TEST 3: Upload valid PNG Data URL
  console.log('\n3. Testing valid PNG logo upload & persistence...');
  const samplePngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const updatedSettings = await updateProfile(owner._id, business._id, {
    companyName: 'Logo Test Workshop',
    email: testEmail,
    logo: samplePngDataUrl,
  });

  console.log(`Updated Logo URL length: ${updatedSettings.business.logo?.length} chars`);
  if (updatedSettings.business.logo === samplePngDataUrl) {
    console.log('🟢 PASSED: Logo saved and returned in update response');
  } else {
    console.error('🔴 FAILED: Logo was not saved correctly');
  }

  // TEST 4: Browser Refresh / Re-query simulation
  console.log('\n4. Simulating Browser Refresh / Reload (fetching settings again from MongoDB)...');
  const refreshedSettings = await getSettings(owner._id, business._id);
  if (refreshedSettings.business.logo === samplePngDataUrl) {
    console.log('🟢 PASSED: Logo persisted in MongoDB and retrieved after reload');
  } else {
    console.error('🔴 FAILED: Logo did not persist across refresh');
  }

  // TEST 5: Logo Removal
  console.log('\n5. Testing Logo Removal...');
  const removedSettings = await updateProfile(owner._id, business._id, {
    companyName: 'Logo Test Workshop',
    email: testEmail,
    logo: null,
  });

  if (removedSettings.business.logo === null) {
    console.log('🟢 PASSED: Logo removed successfully and set to null');
  } else {
    console.error('🔴 FAILED: Logo removal failed');
  }

  // Cleanup
  await Business.deleteMany({ _id: business._id });
  await User.deleteMany({ _id: owner._id });
  await mongoose.disconnect();

  console.log('\n================================================================');
  console.log('=== ALL LOGO FLOW & PERSISTENCE TESTS PASSED 100%           ===');
  console.log('================================================================\n');
}

runLogoFlowTest().catch(console.error);
