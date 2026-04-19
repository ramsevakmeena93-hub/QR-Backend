import axios from 'axios';

// Track any user action to the backend
export const trackActivity = async (action, details, metadata = {}) => {
  try {
    const userStr = localStorage.getItem('user') || localStorage.getItem('googleUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return;

    await axios.post('/api/logs/track', {
      userId: user.id || user.email,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action,
      details,
      metadata
    });
  } catch {
    // Silently fail — logging should never break the app
  }
};

// Predefined action helpers
export const logLogin = (user) => trackActivity('LOGIN', `${user.name} logged in via Google`, { method: 'google' });
export const logLogout = (user) => trackActivity('LOGOUT', `${user.name} logged out`);
export const logPageVisit = (page) => trackActivity('PAGE_VISIT', `Visited ${page}`, { page });
export const logQRScan = (className) => trackActivity('QR_SCAN', `Scanned QR for ${className}`, { className });
export const logFeedback = (className) => trackActivity('FEEDBACK_SUBMITTED', `Submitted feedback for ${className}`, { className });
