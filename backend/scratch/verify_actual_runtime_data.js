import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from '../src/models/Business.js';
import User from '../src/models/User.js';
import { getServices } from '../src/modules/settings/settings.service.js';

dotenv.config();

async function runRuntimeVerification() {
  console.log('================================================================');
  console.log('=== REAL RUNTIME MONGODB & API RESOLUTION VERIFICATION       ===');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGO_URL);

  const user = await User.findOne({ email: 'haneenmuhammedwork@gmail.com' });
  const business = await Business.findOne({ ownerId: user._id });

  console.log(`B. Logged-In User Email: ${user.email}`);
  console.log(`C. Logged-In Business ID: ${business._id} ("${business.name}")`);

  console.log('\n--- Raw MongoDB servicesConfigured array ---');
  console.dir(business.servicesConfigured, { depth: null });

  console.log('\n--- GET /api/owner/settings/services API Response ---');
  const apiRes = await getServices(user._id, business._id);
  console.dir(apiRes.servicesConfigured, { depth: null });

  console.log('\n--- Simulated Frontend NewJob.jsx resolution ---');
  ['4-wheeler', '2-wheeler', 'custom'].forEach((cat) => {
    console.log(`\nSelected Category: "${cat}"`);
    const isTwo = cat === '2-wheeler';
    const isCust = cat === 'custom';

    const filtered = apiRes.servicesConfigured
      .filter((s) => {
        if (s.enabled === false) return false;
        const c = String(s.vehicleCategory || s.category || '').toLowerCase();
        if (isTwo) {
          return c === '2-wheeler' || c === 'bike' || c === 'scooter' || c === 'moped';
        } else if (isCust) {
          return c === 'custom' || c === 'van' || c === 'truck' || c === 'bus' || c === 'rickshaw' || c === 'heavy';
        } else {
          return c === '4-wheeler' || c === 'car' || c === 'suv' || c === 'sedan' || c === 'hatchback' || c === 'pickup';
        }
      })
      .map((s) => ({
        name: s.name,
        category: s.vehicleCategory,
        resolvedPrice: s.price,
        display: s.price > 0 ? `₹${s.price}` : '--',
      }));

    console.dir(filtered, { depth: null });
  });

  await mongoose.disconnect();
  console.log('\n================================================================\n');
}

runRuntimeVerification().catch(console.error);
