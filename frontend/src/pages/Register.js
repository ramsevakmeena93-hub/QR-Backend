import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

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
  return { admissionYear, branchCode: branchCode.toUpperCase(), section, roll, enrollmentNo, yearOfStudy };
}

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', employeeId: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const emailLower = form.email.toLowerCase().trim();
      let extra = {};

      if (form.role === 'student') {
        if (!emailLower.endsWith('@mitsgwl.ac.in')) {
          toast.error('Students must use @mitsgwl.ac.in email');
          setLoading(false);
          return;
        }
        const parsed = parseStudentEmail(emailLower);
        if (!parsed) {
          toast.error('Invalid college email format. Example: 25tc1aj7@mitsgwl.ac.in');
          setLoading(false);
          return;
        }
        extra = {
          rollNumber: parsed.enrollmentNo,
          branch: BRANCH_MAP[parsed.branchCode.toLowerCase()] || parsed.branchCode,
          section: parsed.section,
          admissionYear: parsed.admissionYear,
          yearOfStudy: parsed.yearOfStudy,
          department: parsed.branchCode
        };
      }

      const user = await register({ ...form, email: emailLower, ...extra });
      toast.success(`Welcome, ${user.name}! Account created.`);
      navigate(`/${user.role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-10 text-center">
          <img src="/mits-logo.png" alt="MITS Logo" className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-lg" />
          <h1 className="text-white font-bold text-base">Madhav Institute of Technology & Science</h1>
          <p className="text-blue-200 text-xs mt-1">Create Your Account</p>
        </div>

        <div className="px-6 py-8 -mt-4 bg-white dark:bg-gray-900 rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="student">Student</option>
                <option value="teacher">Teacher / Faculty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {form.role === 'student' ? 'College Email (@mitsgwl.ac.in)' : 'Email'}
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder={form.role === 'student' ? '25tc1aj7@mitsgwl.ac.in' : 'your@email.com'}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
              </div>
            </div>

            {form.role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                <input type="text" value={form.employeeId}
                  onChange={e => setForm({ ...form, employeeId: e.target.value })}
                  placeholder="e.g., DT001"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a password (min 6 chars)"
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 font-semibold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
