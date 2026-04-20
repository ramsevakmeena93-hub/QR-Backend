import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const STUDENT_DOMAIN = 'mitsgwl.ac.in';

const BRANCH_MAP = {
  tc: 'CST', cs: 'CS', it: 'IT', ec: 'EC',
  me: 'ME', ce: 'CE', ee: 'EE', bt: 'BT',
};

function parseStudentEmail(email) {
  const local = email.split('@')[0].toLowerCase();
  const match = local.match(/^(\d{2})([a-z]+)(\d)([a-z]+)(\d+)$/);
  if (!match) return null;
  const [, yearStr, branchCode, section, initials, roll] = match;
  const admissionYear = 2000 + parseInt(yearStr);
  const yearOfStudy = Math.min(new Date().getFullYear() - admissionYear + 1, 4);
  const enrollmentNo = `${branchCode.toUpperCase()}${yearStr}O${section}${initials.toUpperCase()}${roll}`;
  return { admissionYear, branchCode: branchCode.toUpperCase(), section, roll, enrollmentNo, yearOfStudy, branch: BRANCH_MAP[branchCode] || branchCode.toUpperCase() };
}

const Login = () => {
  const { login, setGoogleUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email/Password login — uses real MongoDB backend
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      toast.success(`Welcome, ${user.name}!`);
      navigate(`/${user.role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In — auto-registers if new user
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email: gEmail, name, picture } = decoded;
      const emailLower = gEmail.toLowerCase();

      // Try to login first
      try {
        const user = await login(emailLower, `google_${decoded.sub}`);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(`/${user.role}`);
        return;
      } catch {
        // User doesn't exist — auto-register
      }

      // Determine role from email
      let role = 'student';
      let extra = {};

      if (emailLower.endsWith(`@${STUDENT_DOMAIN}`)) {
        role = 'student';
        const parsed = parseStudentEmail(emailLower);
        if (parsed) {
          extra = {
            rollNumber: parsed.enrollmentNo,
            branch: parsed.branch,
            section: parsed.section,
            admissionYear: parsed.admissionYear,
            yearOfStudy: parsed.yearOfStudy,
            department: parsed.branchCode
          };
        }
      } else {
        // Non-college email — set as teacher by default, admin can change
        role = 'teacher';
        extra = { department: 'CST' };
      }

      // Auto-register with Google
      const { register } = require('../context/AuthContext');
      const axios = (await import('axios')).default;
      const res = await axios.post('/api/auth/register', {
        name, email: emailLower,
        password: `google_${decoded.sub}`,
        role, ...extra,
        loginMethod: 'google', picture
      });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      const axiosDefault = (await import('axios')).default;
      axiosDefault.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setGoogleUser({ ...user, picture, loginMethod: 'google' });
      toast.success(`Welcome, ${name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error('Google Sign-In failed. Please use email/password.');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-10 text-center">
            <img src="/mits-logo.png" alt="MITS Logo"
              className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-lg" />
            <h1 className="text-white font-bold text-base leading-tight">
              Madhav Institute of Technology & Science
            </h1>
            <p className="text-blue-200 text-xs mt-1">Attendance Management System</p>
          </div>

          <div className="px-6 py-8 -mt-4 bg-white dark:bg-gray-900 rounded-t-3xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-5">Sign in to continue</p>

            {/* Google Sign-In */}
            {GOOGLE_CLIENT_ID && (
              <div className="mb-4">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Sign-In failed')}
                    theme="outline" size="large" width="300"
                    text="signin_with" shape="rectangular"
                  />
                </div>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <input type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <input type={showPass ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
              New user?{' '}
              <button onClick={() => navigate('/register')} className="text-blue-600 font-semibold hover:underline">
                Create Account
              </button>
            </p>

            <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-4">
              Developed by <span className="text-blue-500 font-semibold">Ajay Meena</span>
              {' & '}
              <span className="text-indigo-500 font-semibold">Mohammad Shafat Ali Khan</span>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
