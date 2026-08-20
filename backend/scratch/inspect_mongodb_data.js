import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from '../src/models/Business.js';
import User from '../src/models/User.js';

dotenv.config();

async function inspectData() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to MongoDB Atlas\n');

  const users = await User.find({}, 'fullName email role isEmailVerified').lean();
  console.log(`=== USERS FOUND (${users.length}) ===`);
  console.dir(users, { depth: null });

  const businesses = await Business.find({}).lean();
  console.log(`\n=== BUSINESSES FOUND (${businesses.length}) ===`);
  businesses.forEach((b, idx) => {
    console.log(`\n--- Business #${idx + 1} ---`);
    console.log(`ID: ${b._id}`);
    console.log(`Name: ${b.name}`);
    console.log(`Owner ID: ${b.ownerId}`);
    console.log(`Business Type: ${b.businessType}`);
    console.log(`servicesConfigured (${b.servicesConfigured?.length || 0} items):`);
    console.dir(b.servicesConfigured, { depth: null });
    console.log(`categoryPricing:`);
    console.dir(b.categoryPricing, { depth: null });
  });

  await mongoose.disconnect();
}

inspectData().catch(console.error);
