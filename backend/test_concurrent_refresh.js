import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './src/models/User.js';
import RefreshToken from './src/modules/auth/refresh-token.model.js';

dotenv.config();

const API_BASE = 'http://localhost:5001/api';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'sparklepro_super_secret_access_key_2026_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sparklepro_super_secret_refresh_key_2026_key';

async function runConcurrentRefreshTest() {
  console.log('================================================================');
  console.log('=== CONCURRENT REFRESH SINGLE-FLIGHT MUTEX TEST             ===');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/sparklepro');

  // Create clean test user
  const testEmail = 'concurrent_refresh_test@sparklepro.com';
  await User.deleteMany({ email: testEmail });

  const user = await User.create({
    fullName: 'Concurrent Tester',
    email: testEmail,
    password: '$2a$10$abcdefghijklmnopqrstuuu',
    role: 'OWNER',
    isEmailVerified: true,
  });

  await RefreshToken.deleteMany({ userId: user._id });

  // Issue expired Access Token (expired 10 seconds ago)
  const expiredAccessToken = jwt.sign(
    { userId: user._id.toString(), role: user.role, businessId: null },
    JWT_ACCESS_SECRET,
    { expiresIn: '-10s' }
  );

  // Issue valid Refresh Token
  const familyId = new mongoose.Types.ObjectId().toString();
  const jti = new mongoose.Types.ObjectId().toString();
  const validRefreshToken = jwt.sign(
    { userId: user._id.toString(), jti, familyId, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  const tokenHash = await import('bcryptjs').then((b) => b.default.hash(validRefreshToken, 10));
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    familyId,
    jti,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Client Simulation of Single-Flight Interceptor
  let isRefreshing = false;
  let failedQueue = [];
  let refreshCallCount = 0;
  let activeRefreshToken = validRefreshToken;

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
    failedQueue = [];
  };

  const simulatedApiCall = async (endpoint, currentAccessToken) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
    });

    if (res.status === 401) {
      if (isRefreshing) {
        // Wait on single in-flight refresh promise
        const newToken = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        // Retry request with new access token
        return fetch(`${API_BASE}${endpoint}`, {
          headers: { Authorization: `Bearer ${newToken}` },
        }).then((r) => r.json());
      }

      isRefreshing = true;
      refreshCallCount++;

      try {
        const refRes = await fetch(`${API_BASE}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: activeRefreshToken }),
        });

        const refData = await refRes.json();
        if (refRes.status === 200 && refData.data?.accessToken) {
          const newAccess = refData.data.accessToken;
          activeRefreshToken = refData.data.refreshToken;
          processQueue(null, newAccess);

          return fetch(`${API_BASE}${endpoint}`, {
            headers: { Authorization: `Bearer ${newAccess}` },
          }).then((r) => r.json());
        } else {
          throw new Error('Refresh failed');
        }
      } catch (err) {
        processQueue(err, null);
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    return res.json();
  };

  console.log('Firing 10 PARALLEL SIMULTANEOUS REQUESTS with EXPIRED Access Token...');
  const endpoints = [
    '/auth/me',
    '/auth/me',
    '/auth/me',
    '/auth/me',
    '/auth/me',
    '/auth/me',
    '/auth/me',
    '/auth/me',
    '/auth/me',
    '/auth/me',
  ];

  const results = await Promise.all(endpoints.map((ep) => simulatedApiCall(ep, expiredAccessToken)));

  console.log(`\nTotal Refresh HTTP Requests Sent: ${refreshCallCount}`);
  console.log(`Total Parallel Responses Received: ${results.length}`);
  const allSuccessful = results.every((r) => r.success && r.data?.email === testEmail);

  if (refreshCallCount === 1 && allSuccessful) {
    console.log('\n🟢 SINGLE-FLIGHT REFRESH MUTEX TEST PASSED SUCCESSFULLY!');
    console.log('✓ Exactly ONE refresh request executed');
    console.log('✓ All 10 parallel requests waited and retried successfully');
  } else {
    console.error('\n🔴 CONCURRENT REFRESH TEST FAILED');
  }

  // Cleanup
  await RefreshToken.deleteMany({ userId: user._id });
  await User.deleteMany({ _id: user._id });
  await mongoose.disconnect();
}

runConcurrentRefreshTest().catch((err) => {
  console.error('Concurrent test error:', err);
  process.exit(1);
});
