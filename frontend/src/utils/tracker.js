import axios from 'axios';

// Global click & interaction tracker
// Automatically logs every user action on the website

const getUser = () => {
  try {
    const u = localStorage.getItem('googleUser') || localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

const send = async (action, details, metadata = {}) => {
  try {
    const user = getUser();
    if (!user) return; // don't log unauthenticated actions
    await axios.post('/api/logs/track', {
      userId: user.id || user.email,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action,
      details,
      metadata: {
        ...metadata,
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      }
    });
  } catch { /* never break the app */ }
};

// Track page navigation
export const trackPage = (pageName) =>
  send('PAGE_VISIT', `Visited: ${pageName}`, { page: pageName });

// Track any button/link click
export const trackClick = (elementName, context = '') =>
  send('CLICK', `Clicked: ${elementName}${context ? ` (${context})` : ''}`, { element: elementName, context });

// Track form submissions
export const trackForm = (formName, data = {}) =>
  send('FORM_SUBMIT', `Submitted: ${formName}`, { form: formName, ...data });

// Track QR generation
export const trackQRGenerate = (className) =>
  send('QR_GENERATED', `QR generated for: ${className}`, { className });

// Track attendance
export const trackAttendance = (className) =>
  send('ATTENDANCE_MARKED', `Attendance marked: ${className}`, { className });

// Track feedback
export const trackFeedback = (className) =>
  send('FEEDBACK_SUBMITTED', `Feedback submitted for: ${className}`, { className });

// Track downloads
export const trackDownload = (fileName) =>
  send('DOWNLOAD', `Downloaded: ${fileName}`, { fileName });

// Track errors
export const trackError = (errorMsg, context = '') =>
  send('CLIENT_ERROR', `Error: ${errorMsg}`, { error: errorMsg, context });

// Track search
export const trackSearch = (query, section) =>
  send('SEARCH', `Searched: "${query}" in ${section}`, { query, section });

// ─── Global Auto-Tracker ─────────────────────────────────────────────────────
// Attach to document to capture ALL clicks automatically
export const initGlobalTracker = () => {
  document.addEventListener('click', (e) => {
    const user = getUser();
    if (!user) return;

    const target = e.target;
    // Find the nearest meaningful element
    const el = target.closest('button, a, [data-track], input[type="submit"]');
    if (!el) return;

    const label =
      el.getAttribute('data-track') ||
      el.getAttribute('aria-label') ||
      el.innerText?.trim()?.substring(0, 50) ||
      el.getAttribute('href') ||
      el.type ||
      'unknown';

    const page = window.location.pathname;

    send('CLICK', `${label}`, {
      element: el.tagName.toLowerCase(),
      label,
      page,
      href: el.getAttribute('href') || null
    });
  }, true); // capture phase = catches all clicks

  // Track route changes
  let lastPath = window.location.pathname;
  const checkRoute = () => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      send('PAGE_VISIT', `Navigated to: ${lastPath}`, { path: lastPath });
    }
  };
  setInterval(checkRoute, 500);
};
