import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

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

        {/* Form */}
        <div className="px-6 py-8 -mt-4 bg-white dark:bg-gray-900 rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
            Sign in with your college email
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="25tc1aj7@mitsgwl.ac.in"
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-6">
            Developed by <span className="text-blue-500 font-semibold">Ajay Meena</span>
            {' & '}
            <span className="text-indigo-500 font-semibold">Mohammad Shafat Ali Khan</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
