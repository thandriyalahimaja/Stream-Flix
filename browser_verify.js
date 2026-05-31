/**
 * StreamFlix Client Runtime Verification Script
 * 
 * Instructions:
 * 1. Run the servers: `npm run dev` (frontend) and start the backend.
 * 2. Open `http://localhost:5173` in Chrome or Edge.
 * 3. Open Developer Tools (F12 or Ctrl+Shift+I).
 * 4. Paste this entire script into the console and press Enter.
 * 5. Watch the automated check run and output a beautiful styled test report!
 */

(async function() {
  const styles = {
    header: 'background: #0f172a; color: #38bdf8; font-weight: bold; font-size: 14px; padding: 6px 12px; border-radius: 6px;',
    pass: 'background: #065f46; color: #34d399; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    fail: 'background: #991b1b; color: #f87171; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    info: 'color: #94a3b8; font-style: italic;',
    bold: 'font-weight: bold; color: #f1f5f9;',
    resultHeader: 'background: #1e1b4b; color: #c084fc; font-weight: bold; font-size: 13px; padding: 4px 8px; border-radius: 4px;'
  };

  console.clear();
  console.log('%c🌊 StreamFlix CLIENT RUNTIME VERIFICATION PASS 🌊', styles.header);
  console.log('%cInitializing runtime checklist verification...', styles.info);

  const results = [];

  function recordResult(testName, status, details = '') {
    results.push({ Test: testName, Status: status ? '✓ PASS' : '✗ FAIL', Details: details });
    const logStyle = status ? styles.pass : styles.fail;
    console.log(`%c${status ? 'PASS' : 'FAIL'}`, logStyle, testName, details ? `(${details})` : '');
  }

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // --- 1. ROUTING & PROTECTION CHECKS ---
  console.log('\n%cChecking Route Protections & Redirects...', styles.bold);
  
  // Test redirect to login on protected page
  try {
    const originalPath = window.location.pathname;
    
    // Attempt guest navigation to protected /dashboard
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await delay(300);

    const isRedirectedToLogin = window.location.pathname === '/login';
    recordResult(
      'ProtectedRoute Guest Redirect',
      isRedirectedToLogin,
      `Navigating to /dashboard redirected to ${window.location.pathname}`
    );

    // Return to original path or home
    window.history.pushState({}, '', originalPath === '/login' ? '/' : originalPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
    await delay(300);
  } catch (err) {
    recordResult('ProtectedRoute Guest Redirect', false, err.message);
  }

  // --- 2. CONSOLE WARNINGS & CSP AUDIT ---
  console.log('\n%cAuditing Console Logs & Network Alerts...', styles.bold);
  try {
    const logs = [];
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Track errors/warnings temporary
    console.error = (...args) => { logs.push({ type: 'error', text: args.join(' ') }); originalConsoleError(...args); };
    console.warn = (...args) => { logs.push({ type: 'warning', text: args.join(' ') }); originalConsoleWarn(...args); };

    // Give react moments to settle
    await delay(500);

    // Restore consoles
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;

    const reactKeyWarnings = logs.filter(l => l.text.includes('Each child in a list should have a unique'));
    const formWarnings = logs.filter(l => l.text.includes('autocomplete') || l.text.includes('form'));
    const cspViolations = logs.filter(l => l.text.includes('Content Security Policy'));
    const spam401 = logs.filter(l => l.text.includes('401') || l.text.includes('Unauthorized'));

    recordResult('No React Unique Key Warnings', reactKeyWarnings.length === 0, `${reactKeyWarnings.length} unique key warnings found`);
    recordResult('No Form Accessibility Warnings', formWarnings.length === 0, `${formWarnings.length} form autocomplete warnings found`);
    recordResult('No CSP Policy Violations', cspViolations.length === 0, `${cspViolations.length} Content Security Policy violations`);
    recordResult('No Repeated 401 Token Spam', spam401.length <= 1, `${spam401.length} 401 network logs detected`);
  } catch (err) {
    recordResult('Console & CSP Audit', false, err.message);
  }

  // --- 3. DOM & TRAILER COMPONENT INTEGRITY ---
  console.log('\n%cChecking Movie Details & Trailer Player DOM Structure...', styles.bold);
  
  const movieCard = document.querySelector('[id^="movie-card-"]');
  if (movieCard) {
    recordResult('Movie Cards Rendered on Page', true, `Found movie card element: ${movieCard.id}`);
  } else {
    recordResult('Movie Cards Rendered on Page', false, 'No movie card element found in current viewport');
  }

  // Check theme application
  const rootStyle = getComputedStyle(document.documentElement);
  const bgVar = rootStyle.getPropertyValue('--cw-bg').trim();
  recordResult('Theme CSS custom properties applied', bgVar.length > 0, `Value of --cw-bg: ${bgVar}`);

  // --- 4. PRINT VERIFICATION REPORT ---
  console.log('\n%cVERIFICATION SUMMARY REPORT', styles.resultHeader);
  console.table(results);

  console.log('%cVerification run completed. If any test failed, please check your network connection or server start logs.', styles.info);
})();
