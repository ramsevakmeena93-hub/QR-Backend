import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from 'react-toastify';
import { FiMail, FiLock } from 'react-icons/fi';

// ─── Email Parser ────────────────────────────────────────────────────────────
// Student email format: 25tc1aj7@mitsgwl.ac.in
//   25  = admission year (2025)
//   tc  = branch code
//   1   = section
//   aj  = initials
//   7   = roll number
const BRANCH_MAP = {
  tc: 'CST (Computer Science & Technology)',
  cs: 'CS (Computer Science)',
  it: 'IT (Information Technology)',
  ec: 'EC (Electronics & Communication)',
  me: 'ME (Mechanical Engineering)',
  ce: 'CE (Civil Engineering)',
  ee: 'EE (Electrical Engineering)',
  bt: 'BT (Biotechnology)',
};

const FACULTY_EMAILS = ['ramsevakmeena93@gmail.com'];
const STUDENT_DOMAIN = 'mitsgwl.ac.in';

function parseStudentEmail(email) {
  // e.g. 25tc1aj7@mitsgwl.ac.in
  const local = email.split('@')[0].toLowerCase(); // "25tc1aj7"
  const match = local.match(/^(\d{2})([a-z]+)(\d)([a-z]+)(\d+)$/);
  if (!match) return null;

  const [, yearStr, branchCode, section, initials, roll] = match;
  const admissionYear = 2000 + parseInt(yearStr);
  const currentYear = new Date().getFullYear();
  const yearOfStudy = currentYear - admissionYear + 1;
  const yearLabel =
    yearOfStudy === 1 ? '1st Year' :
    yearOfStudy === 2 ? '2nd Year' :
    yearOfStudy === 3 ? '3rd Year' : '4th Year';

  const enrollmentNo = `${branchCode.toUpperCase()}${yearStr}O${section}${initials.toUpperCase()}${roll}`;

  return {
    admissionYear,
    branch: BRANCH_MAP[branchCode] || branchCode.toUpperCase(),
    branchCode: branchCode.toUpperCase(),
    section,
    initials: initials.toUpperCase(),
    roll,
    enrollmentNo,
    yearOfStudy: Math.min(yearOfStudy, 4),
    yearLabel,
  };
}

// ─── Google Client ID ─────────────────────────────────────────────────────────
// Replace with your actual Google OAuth Client ID from console.cloud.google.com
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

// ─── Main Login Component ─────────────────────────────────────────────────────
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, setGoogleUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate(`/${user.role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture } = decoded;

      // Check if faculty
      if (FACULTY_EMAILS.includes(email.toLowerCase())) {
        const user = {
          id: email,
          name,
          email,
          picture,
          role: 'teacher',
          department: 'CST',
          loginMethod: 'google',
        };
        setGoogleUser(user);
        toast.success(`Welcome, ${name}! Logged in as Faculty.`);
        navigate('/teacher');
        return;
      }

      // Check if student (college domain)
      if (email.endsWith(`@${STUDENT_DOMAIN}`)) {
        const parsed = parseStudentEmail(email);
        if (!parsed) {
          toast.error('Could not parse your college email. Please contact admin.');
          return;
        }
        const user = {
          id: email,
          name,
          email,
          picture,
          role: 'student',
          department: parsed.branchCode,
          enrollmentNo: parsed.enrollmentNo,
          branch: parsed.branch,
          branchCode: parsed.branchCode,
          section: parsed.section,
          admissionYear: parsed.admissionYear,
          yearOfStudy: parsed.yearOfStudy,
          yearLabel: parsed.yearLabel,
          roll: parsed.roll,
          loginMethod: 'google',
        };
        setGoogleUser(user);
        toast.success(`Welcome, ${name}!`);
        navigate('/student');
        return;
      }

      // Not authorized
      toast.error(`Access denied. Only @${STUDENT_DOMAIN} students and authorized faculty can login.`);
    } catch (err) {
      console.error(err);
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transition-colors duration-300">
          {/* Branding */}
          <div className="text-center mb-8">
            <img src="/mits-logo.png" alt="MITS Logo"
              className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-lg hover:rotate-12 transition-transform duration-300" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Madhav Institute of Technology & Science
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Attendance Management System</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          </div>

          {/* Google Sign-In */}
          <div className="mb-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
              Sign in with your college Google account
            </p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                width="360"
                text="signin_with"
                shape="rectangular"
              />
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                📧 Students: use <strong>@mitsgwl.ac.in</strong> account<br />
                👨‍🏫 Faculty: use your authorized Gmail
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            <span className="text-xs text-gray-400 dark:text-gray-500">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input type="email" required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input type="password" required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition-all hover:scale-105">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-6">
            Developed by <span className="text-blue-500 font-semibold">Ajay Meena</span>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
