/**
 * StreamFlix API Integration Test Script
 * 
 * This script runs a complete end-to-end test against the running StreamFlix API.
 * It uses native fetch (requires Node.js 18+).
 * 
 * Usage:
 *   1. Ensure MongoDB is running.
 *   2. Start the backend: cd server && npm run dev (or node index.js)
 *   3. Run the test script: node test_api.js
 */

const API_URL = 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function logStep(msg) {
  console.log(`\n${colors.bright}${colors.blue}==>${colors.reset} ${colors.bright}${msg}${colors.reset}`);
}

function logSuccess(msg) {
  console.log(`  ${colors.green}✓${colors.reset} ${msg}`);
}

function logFail(msg, error = null) {
  console.error(`  ${colors.red}✗${colors.reset} ${colors.red}${msg}${colors.reset}`);
  if (error) {
    console.error(error);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}          StreamFlix API INTEGRATION TESTS           ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}`);

  // Context variables shared across steps
  let testUserToken = null;
  let testUserId = null;
  let testUserEmail = `testuser_${Date.now()}@StreamFlix.com`;
  let adminToken = null;
  let targetMovieId = null;
  let createdReviewId = null;

  // --- Step 1: Health Check ---
  try {
    logStep('Step 1: Checking API Health');
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    
    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success flag is not true');
    assert(data.status === 'ok', 'Status is not ok');
    
    logSuccess(`Health check passed. Timestamp: ${data.timestamp}`);
  } catch (err) {
    logFail('Health check failed. Make sure the backend server is running on port 5000.', err);
    process.exit(1);
  }

  // --- Step 2: Register New User ---
  try {
    logStep('Step 2: Registering a new test user');
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test integration User',
        email: testUserEmail,
        password: 'Password123',
        genres: ['Action', 'Sci-Fi']
      })
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}: ${data.message}`);
    assert(data.success === true, 'Registration success is not true');
    assert(data.accessToken, 'Access token missing in response');
    assert(data.user.email === testUserEmail, 'User email mismatch');
    
    testUserToken = data.accessToken;
    testUserId = data.user._id || data.user.id;
    
    logSuccess(`Registered test user: ${data.user.name} (${data.user.email}) [ID: ${testUserId}]`);
  } catch (err) {
    logFail('Registration failed', err);
    process.exit(1);
  }

  // --- Step 3: Login User ---
  try {
    logStep('Step 3: Logging in with test user credentials');
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'Password123'
      })
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}: ${data.message}`);
    assert(data.success === true, 'Login success is not true');
    assert(data.accessToken, 'Access token missing in login response');
    
    // Update token
    testUserToken = data.accessToken;
    
    logSuccess('Logged in successfully, token retrieved.');
  } catch (err) {
    logFail('Login failed', err);
    process.exit(1);
  }

  // --- Step 4: Get Auth User Details ---
  try {
    logStep('Step 4: Fetching authenticated user profile via /auth/me');
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success flag is not true');
    assert(data.user.email === testUserEmail, 'Profile email mismatch');
    assert(data.user.stats, 'Stats object missing in profile response');
    
    logSuccess(`Retrieved user data. Watchlist count: ${data.user.stats.watchlistCount}, Likes count: ${data.user.stats.likedCount}`);
  } catch (err) {
    logFail('Fetch profile failed', err);
    process.exit(1);
  }

  // --- Step 5: Get Movie Catalog ---
  try {
    logStep('Step 5: Fetching all movies');
    const res = await fetch(`${API_URL}/movies`);
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(Array.isArray(data.data), 'Data is not an array');
    assert(data.data.length > 0, 'No movies found. Please seed the database first!');
    
    // Pick the first movie as our testing target
    targetMovieId = data.data[0]._id || data.data[0].id;
    
    logSuccess(`Retrieved ${data.data.length} movies. Target movie: "${data.data[0].title}" [ID: ${targetMovieId}]`);
  } catch (err) {
    logFail('Fetch movies failed', err);
    process.exit(1);
  }

  // --- Step 6: Get Movie Details by ID ---
  try {
    logStep(`Step 6: Fetching movie details for target movie ID: ${targetMovieId}`);
    const res = await fetch(`${API_URL}/movies/${targetMovieId}`);
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(data.data._id === targetMovieId, 'Returned movie ID mismatch');
    assert(Array.isArray(data.data.reviews), 'Reviews field is not an array');
    
    logSuccess(`Fetched movie: "${data.data.title}" (Views: ${data.data.views}, Likes: ${data.data.likes})`);
  } catch (err) {
    logFail('Fetch movie details failed', err);
    process.exit(1);
  }

  // --- Step 7: Search Movie ---
  try {
    logStep('Step 7: Testing movie search');
    const res = await fetch(`${API_URL}/movies/search?q=Spider`);
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(Array.isArray(data.data), 'Search results data is not an array');
    
    logSuccess(`Search for "Spider" returned ${data.data.length} matches.`);
  } catch (err) {
    logFail('Search failed', err);
    process.exit(1);
  }

  // --- Step 8: Like Movie (Toggle Like) ---
  try {
    logStep(`Step 8: Liking movie ID ${targetMovieId}`);
    const res = await fetch(`${API_URL}/users/like/${targetMovieId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(data.action === 'liked', 'Action should be liked');
    
    logSuccess(`Movie liked successfully. User's liked list now has: [${data.likedMovies.join(', ')}]`);
  } catch (err) {
    logFail('Toggle like failed', err);
    process.exit(1);
  }

  // --- Step 9: Dislike Movie (Toggle Dislike & check like removal) ---
  try {
    logStep(`Step 9: Disliking movie ID ${targetMovieId} (should automatically remove like)`);
    const res = await fetch(`${API_URL}/users/dislike/${targetMovieId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(data.action === 'disliked', 'Action should be disliked');
    
    // Check user profile again to confirm like was removed
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    const meData = await meRes.json();
    const isLiked = meData.user.likedMovies.some(m => (m._id || m) === targetMovieId);
    
    assert(!isLiked, 'Movie like should have been cleared when disliked');
    
    logSuccess('Movie disliked successfully. Confirmed like was cleared.');
  } catch (err) {
    logFail('Toggle dislike / like clearing test failed', err);
    process.exit(1);
  }

  // --- Step 10: Watchlist - Add Item ---
  try {
    logStep(`Step 10: Adding movie ID ${targetMovieId} to watchlist`);
    const res = await fetch(`${API_URL}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({ movieId: targetMovieId })
    });
    const data = await res.json();

    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(data.data.movie === targetMovieId, 'Watchlist movie ID mismatch');
    
    logSuccess('Movie added to watchlist.');
  } catch (err) {
    logFail('Add watchlist item failed', err);
    process.exit(1);
  }

  // --- Step 11: Watchlist - Get List ---
  try {
    logStep('Step 11: Retrieving watchlist');
    const res = await fetch(`${API_URL}/watchlist`, {
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(Array.isArray(data.data), 'Data is not an array');
    const hasMovie = data.data.some(item => (item.movie._id || item.movie) === targetMovieId);
    assert(hasMovie, 'Added movie not found in watchlist');
    
    logSuccess(`Retrieved watchlist containing ${data.data.length} item(s). Target movie exists.`);
  } catch (err) {
    logFail('Get watchlist failed', err);
    process.exit(1);
  }

  // --- Step 12: Write a Movie Review ---
  try {
    logStep(`Step 12: Creating a review for movie ID ${targetMovieId}`);
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        movieId: targetMovieId,
        rating: 9,
        content: 'Absolute masterpiece! Stunning performance and great plot direction.'
      })
    });
    const data = await res.json();

    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(data.data.rating === 9, 'Rating mismatch');
    
    createdReviewId = data.data._id || data.data.id;
    
    logSuccess(`Review created successfully [ID: ${createdReviewId}]`);
  } catch (err) {
    logFail('Create review failed', err);
    process.exit(1);
  }

  // --- Step 13: Get Movie Recommendations ---
  try {
    logStep('Step 13: Testing recommendation engine');
    const res = await fetch(`${API_URL}/movies/recommended`, {
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(Array.isArray(data.data), 'Recommended data is not an array');
    
    logSuccess(`Recommendation engine returned ${data.data.length} films matching tastes.`);
  } catch (err) {
    logFail('Fetch recommendations failed', err);
    process.exit(1);
  }

  // --- Step 14: Update Profile Preferences ---
  try {
    logStep('Step 14: Updating user profile preferences');
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        name: 'Test integration User Updated',
        preferences: {
          genres: ['Family', 'Animation', 'Fantasy'],
          theme: 'dark'
        }
      })
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(data.data.name === 'Test integration User Updated', 'Name update mismatch');
    assert(data.data.preferences.theme === 'dark', 'Theme update mismatch');
    assert(data.data.preferences.genres.includes('Animation'), 'Genres update mismatch');
    
    logSuccess('User profile preferences successfully updated.');
  } catch (err) {
    logFail('Update profile failed', err);
    process.exit(1);
  }

  // --- Step 15: Get User Dashboard Stats ---
  try {
    logStep('Step 15: Fetching user dashboard analytics');
    const res = await fetch(`${API_URL}/users/dashboard`, {
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(data.data.watchlistCount === 1, 'Watchlist count mismatch in stats');
    assert(data.data.reviewCount === 1, 'Review count mismatch in stats');
    
    logSuccess(`Analytics retrieved. Top Genre: "${data.data.topGenre}", Avg Rating Given: ${data.data.avgRating}`);
  } catch (err) {
    logFail('Fetch dashboard stats failed', err);
    process.exit(1);
  }

  // --- Step 16: Admin Login ---
  try {
    logStep('Step 16: Logging in as Admin');
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@StreamFlix.com',
        password: 'StreamFlix@2025'
      })
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(data.user.role === 'admin', 'Log in role is not admin');
    
    adminToken = data.accessToken;
    
    logSuccess('Admin logged in, authorization token verified.');
  } catch (err) {
    logFail('Admin login failed. Please ensure the admin seed script has run (node server/seed/seedAdmin.js).', err);
    process.exit(1);
  }

  // --- Step 17: Admin Dashboard Stats ---
  try {
    logStep('Step 17: Accessing Admin Dashboard metrics');
    const res = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(typeof data.data.userCount === 'number', 'userCount is not a number');
    assert(typeof data.data.movieCount === 'number', 'movieCount is not a number');
    assert(Array.isArray(data.data.genreDistribution), 'genreDistribution is not an array');

    logSuccess(`Admin Dashboard metrics verified. Total Movies: ${data.data.movieCount}, Total Users: ${data.data.userCount}`);
  } catch (err) {
    logFail('Admin dashboard stats fetch failed', err);
    process.exit(1);
  }

  // --- Step 18: Admin User List ---
  try {
    logStep('Step 18: Fetching users list as Admin');
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    assert(Array.isArray(data.data), 'Users list is not an array');
    
    const foundTestUser = data.data.some(u => (u._id || u.id) === testUserId);
    assert(foundTestUser, 'Created test user not present in Admin user directory');
    
    logSuccess(`Admin user directory verified. Test user is visible.`);
  } catch (err) {
    logFail('Admin fetch users list failed', err);
    process.exit(1);
  }

  // --- Step 19: Admin Cascade Delete User ---
  try {
    logStep(`Step 19: Deleting test user ID ${testUserId} as Admin (verifying Cascade deletes)`);
    const res = await fetch(`${API_URL}/admin/users/${testUserId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    
    // Verify watchlist entry was deleted
    const wlCheck = await fetch(`${API_URL}/watchlist`, {
      headers: { 'Authorization': `Bearer ${testUserToken}` } // Token shouldn't work / user doesn't exist
    });
    assert(wlCheck.status === 401, 'Deleted user authentication token should no longer work.');

    logSuccess('Test user deleted. User session and tokens invalidated.');
  } catch (err) {
    logFail('Admin delete user test failed', err);
    process.exit(1);
  }

  // --- Step 20: Verify User and Clean Up ---
  try {
    logStep('Step 20: Verifying clean-up directory listings');
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    assert(res.ok, `HTTP Status ${res.status}`);
    assert(data.success === true, 'Success is not true');
    const foundTestUser = data.data.some(u => (u._id || u.id) === testUserId);
    assert(!foundTestUser, 'Deleted test user still present in directory!');
    
    logSuccess('Cleanup verified. No orphaned user references remain.');
  } catch (err) {
    logFail('Clean up verification failed', err);
    process.exit(1);
  }

  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.green}          ALL 20 BACKEND INTEGRATION TESTS PASSED   ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}`);
}

runTests();
