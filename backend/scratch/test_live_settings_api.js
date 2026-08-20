import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from '../src/models/Business.js';
import User from '../src/models/User.js';
import { getServices } from '../src/modules/settings/settings.service.js';

dotenv.config();

async function testLiveApi() {
  await mongoose.connect(process.env.MONGO_URL);

  const user = await User.findOne({ email: 'haneenmuhammedwork@gmail.com' });
  const business = await Business.findOne({ ownerId: user._id });

  console.log(`User ID: ${user._id}`);
  console.log(`Business Name: ${business.name}`);

  const servicesData = await getServices(user._id, business._id);
  console.log('\n=== GET /api/owner/settings/services RESPONSE ===');
  console.dir(servicesData, { depth: null });

  await mongoose.disconnect();
}

testLiveApi().catch(console.error);
