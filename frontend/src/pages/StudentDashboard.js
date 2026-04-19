import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { FiBook, FiCheckCircle, FiPercent, FiCalendar, FiDownload, FiTrendingUp, FiAward, FiUsers, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

const StudentDashboard = () => {
  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 p-8 bg-gray-50">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/attendance" element={<AttendanceHistory />} />
          <Route path="/analytics" element={<AdvancedAnalytics />} />
        </Routes>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const { user: authUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [showInsights, setShowInsights] = useState(true);

  useEffect(() => {
    fetchDashboard();
    // Prefer AuthContext user (covers Google login), fallback to localStorage
    if (authUser) {
      setUser(authUser);
    } else {
      const userData = JSON.parse(localStorage.getItem('user') || localStorage.getItem('googleUser') || 'null');
      setUser(userData);
    }
  }, [authUser]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/student/dashboard');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    }
  };

  const totalClasses = stats?.attendanceStats.reduce((sum, s) => sum + parseInt(s.total), 0) || 0;
  const totalAttended = stats?.attendanceStats.reduce((sum, s) => sum + parseInt(s.attended), 0) || 0;
  const overallPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;

  const getPercentageStatus = (percentage) => {
    if (percentage >= 85) return { text: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100', icon: '🌟' };
    if (percentage >= 75) return { text: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '👍' };
    if (percentage >= 65) return { text: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⚠️' };
    return { text: 'Low', color: 'text-red-600', bgColor: 'bg-red-100', icon: '🚨' };
  };

  const status = getPercentageStatus(overallPercentage);

  // Calculate insights
  const lowAttendanceSubjects = stats?.attendanceStats.filter(s => parseFloat(s.percentage) < 75) || [];
  const classesNeededFor75 = lowAttendanceSubjects.map(subject => {
    const attended = parseInt(subject.attended);
    const total = parseInt(subject.total);
    const needed = Math.ceil((0.75 * total - attended) / 0.25);
    return { ...subject, classesNeeded: Math.max(0, needed) };
  });

  // Prepare pie chart data for course-wise attendance
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#6366F1'];
  const pieData = stats?.attendanceStats.map((stat, index) => ({
    name: stat.subject,
    value: parseFloat(stat.percentage),
    code: stat.className,
    color: COLORS[index % COLORS.length]
  })) || [];

  // Calculate streak (consecutive days present)
  const currentStreak = 5; // Demo value
  const bestStreak = 12; // Demo value

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}! {status.icon}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Current Session: Jan-June 2026</p>
      </div>

      {/* Google Profile Card — shown only for Google login */}
      {user?.loginMethod === 'google' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-center gap-5">
            {user.picture ? (
              <img src={user.picture} alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                <FiUser className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-blue-100 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Enrollment No</p>
              <p className="text-white font-bold text-lg">{user.enrollmentNo || '—'}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Branch</p>
              <p className="text-white font-bold text-sm">{user.branchCode || user.department || '—'}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Year</p>
              <p className="text-white font-bold text-lg">{user.yearLabel || '—'}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Section</p>
              <p className="text-white font-bold text-lg">{user.section || '—'}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-4 text-sm text-blue-100">
            <span>🎓 Admission Year: <strong className="text-white">{user.admissionYear}</strong></span>
            <span>📚 {user.branch}</span>
            <span>🔢 Roll No: <strong className="text-white">{user.roll}</strong></span>
          </div>
        </div>
      )}

      {/* Smart Insights Alert */}
      {showInsights && lowAttendanceSubjects.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-6 mb-8 shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Attendance Alert!</h3>
                <p className="text-gray-700 mb-3">
                  You have {lowAttendanceSubjects.length} subject(s) below 75% attendance threshold.
                </p>
                <div className="space-y-2">
                  {classesNeededFor75.slice(0, 2).map((subject, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      📚 <span className="font-semibold">{subject.subject}</span>: Attend next{' '}
                      <span className="font-bold text-orange-600">{subject.classesNeeded}</span> classes to reach 75%
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setShowInsights(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      )}

      {/* Achievement Banner */}
      {excellentSubjects.length >= 3 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 shadow-md">
          <div className="flex gap-4">
            <div className="text-3xl">🏆</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Outstanding Performance!</h3>
              <p className="text-gray-700">
                You have excellent attendance (≥85%) in {excellentSubjects.length} subjects. Keep it up!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <FiBook className="text-3xl text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalClasses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-lg">
              <FiCalendar className="text-3xl text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900">{totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <FiCheckCircle className="text-3xl text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Classes Attended</p>
              <p className="text-3xl font-bold text-gray-900">{totalAttended}</p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-2 ${
          overallPercentage >= 75 ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`${status.bgColor} p-4 rounded-lg`}>
              <FiPercent className={`text-3xl ${status.color}`} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Overall Percentage</p>
              <p className={`text-3xl font-bold ${status.color}`}>{overallPercentage}%</p>
              <p className={`text-sm font-semibold ${status.color}`}>{status.text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Streak & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Current Streak</h3>
            <span className="text-3xl">🔥</span>
          </div>
          <p className="text-4xl font-bold mb-1">{currentStreak} days</p>
          <p className="text-purple-200 text-sm">Keep attending to maintain your streak!</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Best Streak</h3>
            <span className="text-3xl">⭐</span>
          </div>
          <p className="text-4xl font-bold mb-1">{bestStreak} days</p>
          <p className="text-yellow-100 text-sm">Your personal record</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">This Week</h3>
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-4xl font-bold mb-1">18/20</p>
          <p className="text-green-100 text-sm">Classes attended this week</p>
        </div>
      </div>

      {/* Course-wise Attendance Pie Chart */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course-wise Attendance Distribution</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${value}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend 
                formatter={(value, entry) => `${entry.payload.code}: ${entry.payload.value}%`}
                wrapperStyle={{ fontSize: '14px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Attendance Prediction & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎯</span> Attendance Goals
          </h3>
          <div className="space-y-4">
            {stats?.attendanceStats.slice(0, 3).map((subject, idx) => {
              const percentage = parseFloat(subject.percentage);
              const targetGap = 85 - percentage;
              return (
                <div key={idx} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-900">{subject.subject}</p>
                  <p className="text-sm text-gray-600">Current: {subject.percentage}%</p>
                  {percentage < 85 && (
                    <p className="text-sm text-blue-600 font-semibold">
                      {targetGap.toFixed(1)}% away from excellence (85%)
                    </p>
                  )}
                  {percentage >= 85 && (
                    <p className="text-sm text-green-600 font-semibold">✓ Excellent attendance!</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💡</span> Smart Recommendations
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-xl">📊</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Maintain Consistency</p>
                <p className="text-xs text-gray-600">Try to attend all classes this week to improve your overall percentage</p>
              </div>
            </div>
            {lowAttendanceSubjects.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Priority Subjects</p>
                  <p className="text-xs text-gray-600">Focus on {lowAttendanceSubjects[0].subject} - needs immediate attention</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-xl">🎓</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">On Track</p>
                <p className="text-xs text-gray-600">You're doing great! Keep up the good work</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <Link to="/student/classes" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats?.attendanceStats.slice(0, 4).map((stat, index) => {
            const percentage = parseFloat(stat.percentage);
            const barColor = percentage >= 75 ? 'bg-green-500' : percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500';
            const textColor = percentage >= 75 ? 'text-green-600' : percentage >= 65 ? 'text-yellow-600' : 'text-red-600';
            
            return (
              <div key={stat.classId} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{stat.subject}</h3>
                    <p className="text-gray-500 text-sm">{stat.className}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    THEORY
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Attendance:</span>
                    <span className={`text-xl font-bold ${textColor}`}>{stat.percentage}%</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Classes:</span>
                    <span className="text-gray-900 font-semibold">{stat.attended} / {stat.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-500 text-sm">Faculty: {stat.faculty || 'Not Assigned'}</p>
                  <p className="text-gray-400 text-xs mt-1">Sem 2</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scan QR CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to Mark Attendance?</h2>
        <p className="mb-6 text-blue-100">Scan the QR code displayed by your teacher</p>
        <Link
          to="/scan"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block transition-colors"
        >
          Open QR Scanner
        </Link>
      </div>
    </div>
  );
};

const Classes = () => {
  const [stats, setStats] = useState(null);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/student/dashboard');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/student/join-class', { classCode: joinCode });
      toast.success('Successfully joined class!');
      setJoinCode('');
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join class');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Classes</h1>

      {/* Join Class Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Join a New Class</h2>
        <form onSubmit={handleJoinClass} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Class Code (e.g., CS101)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Join Class
          </button>
        </form>
      </div>

      {/* All Enrolled Classes */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Enrolled Classes ({stats?.attendanceStats?.length || 0})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats?.attendanceStats?.map((stat, index) => {
          const percentage = parseFloat(stat.percentage);
          const barColor = percentage >= 75 ? 'bg-green-500' : percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500';
          const textColor = percentage >= 75 ? 'text-green-600' : percentage >= 65 ? 'text-yellow-600' : 'text-red-600';
          
          return (
            <div key={stat.classId} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{stat.subject}</h3>
                  <p className="text-gray-500 text-sm">{stat.className}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                  THEORY
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Attendance:</span>
                  <span className={`text-xl font-bold ${textColor}`}>{stat.percentage}%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Classes:</span>
                  <span className="text-gray-900 font-semibold">{stat.attended} / {stat.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${barColor}`}
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-sm">Faculty: {stat.faculty || 'Not Assigned'}</p>
                <p className="text-gray-400 text-xs mt-1">Sem 2</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {(!stats?.attendanceStats || stats.attendanceStats.length === 0) && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <FiBook className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Classes Yet</h3>
          <p className="text-gray-500">Join a class using the class code provided by your teacher</p>
        </div>
      )}
    </div>
  );
};

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateClasses, setDateClasses] = useState([]);

  useEffect(() => {
    fetchAttendance();
    fetchDashboard();
  }, []);

  const fetchAttendance = async () => {
    const response = await axios.get('/api/student/attendance');
    setAttendance(response.data.attendance);
  };

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/student/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  // Calculate overall stats
  const totalClasses = stats?.attendanceStats.reduce((sum, s) => sum + parseInt(s.total), 0) || 0;
  const totalAttended = stats?.attendanceStats.reduce((sum, s) => sum + parseInt(s.attended), 0) || 0;
  const overallPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;
  const totalAbsent = totalClasses - totalAttended;

  // Prepare data for Present/Absent pie chart
  const presentAbsentData = [
    { name: 'Present', value: totalAttended, color: '#10B981' },
    { name: 'Absent', value: totalAbsent, color: '#EF4444' }
  ];

  // Get calendar data for selected month
  const getCalendarDays = () => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  // Handle date click - show classes for that day
  const handleDateClick = (day) => {
    if (!day) return;
    
    const clickedDate = new Date(selectedYear, selectedMonth, day);
    setSelectedDate(clickedDate);
    
    // Get all classes and their attendance status for this date
    const classesForDate = stats?.attendanceStats.map((stat, index) => {
      // Simulate attendance data for demo (in real app, check actual attendance records)
      const wasPresent = day <= 12 && (day + index) % 3 !== 0;
      
      return {
        ...stat,
        attended: wasPresent,
        time: `${9 + index}:00 AM`,
        faculty: stat.faculty || 'Not Assigned'
      };
    }) || [];
    
    setDateClasses(classesForDate);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Attendance</h1>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center">
            <p className={`text-5xl font-bold mb-2 ${overallPercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {overallPercentage}%
            </p>
            <p className="text-gray-600 text-sm">Attendance Rate</p>
            <p className={`text-sm font-semibold mt-1 ${overallPercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {overallPercentage >= 85 ? 'Excellent' : overallPercentage >= 75 ? 'Good' : overallPercentage >= 65 ? 'Average' : 'Low'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-gray-900 mb-2">{totalAttended}</p>
            <p className="text-gray-600 text-sm">Classes Attended</p>
            <p className="text-gray-400 text-xs mt-1">out of {totalClasses}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-gray-900 mb-2">{stats?.totalClasses || 0}</p>
            <p className="text-gray-600 text-sm">Total Courses</p>
            <p className="text-gray-400 text-xs mt-1">Enrolled</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-gray-900 mb-2">2</p>
            <p className="text-gray-600 text-sm">Semester</p>
            <p className="text-gray-400 text-xs mt-1">Computer Science and Technology</p>
          </div>
        </div>
      </div>

      {/* Overall Attendance Distribution Pie Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Attendance Distribution</h2>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={presentAbsentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {presentAbsentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700">Present</span>
          </div>
        </div>
      </div>

      {/* Attendance Calendar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Calendar</h2>
        
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
              setSelectedDate(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-2xl font-bold"
          >
            ←
          </button>
          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[selectedMonth]} {selectedYear}
          </h3>
          <button
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
              setSelectedDate(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-2xl font-bold"
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          {getCalendarDays().map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }
            
            // Simulate attendance status (in real app, check actual attendance data)
            const isPresent = day <= 12 && day % 3 !== 0;
            const isAbsent = day <= 12 && day % 3 === 0;
            const isToday = day === new Date().getDate() && 
                           selectedMonth === new Date().getMonth() && 
                           selectedYear === new Date().getFullYear();
            const isSelected = selectedDate && 
                              day === selectedDate.getDate() && 
                              selectedMonth === selectedDate.getMonth() && 
                              selectedYear === selectedDate.getFullYear();
            
            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition-all hover:scale-110 cursor-pointer
                  ${isPresent ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                  ${isAbsent ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                  ${!isPresent && !isAbsent ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' : ''}
                  ${isToday ? 'ring-2 ring-blue-500' : ''}
                  ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Present (Day)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Absent (Day)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">No Class</span>
          </div>
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-4">
          💡 Click on any date to view all classes for that day
        </p>
      </div>

      {/* Selected Date Classes */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Classes on {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dateClasses.map((cls, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 shadow-md border-2 ${
                  cls.attended 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{cls.subject}</h3>
                    <p className="text-sm text-gray-600">{cls.className}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    cls.attended 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {cls.attended ? '✓ Present' : '✗ Absent'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-gray-500" />
                    <span className="text-gray-700">Time: {cls.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiBook className="text-gray-500" />
                    <span className="text-gray-700">Faculty: {cls.faculty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPercent className="text-gray-500" />
                    <span className="text-gray-700">Overall: {cls.percentage}% ({cls.attended}/{cls.total})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {dateClasses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No classes scheduled for this date
            </div>
          )}
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Attendance Records ({attendance.length} classes)
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {attendance.slice(0, 20).map((record) => (
            <div key={record._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <FiCalendar className="text-2xl text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(record.markedAt).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Marked by: {record.class?.faculty || 'Faculty'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600 text-xl" />
                  <span className="text-green-600 font-semibold">Present</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {attendance.length === 0 && (
          <div className="p-12 text-center">
            <FiCheckCircle className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No attendance records yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Advanced Analytics Component
const AdvancedAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [analysisMode, setAnalysisMode] = useState('attendance'); // 'attendance' or 'marks'

  useEffect(() => {
    fetchDashboard();
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/student/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  // Calculate metrics
  const totalClasses = stats?.attendanceStats.reduce((sum, s) => sum + parseInt(s.total), 0) || 0;
  const totalAttended = stats?.attendanceStats.reduce((sum, s) => sum + parseInt(s.attended), 0) || 0;
  const overallPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;

  // Generate demo marks data correlated with attendance
  const subjectsWithMarks = stats?.attendanceStats.map(stat => {
    const attendance = parseFloat(stat.percentage);
    // Simulate marks correlation: higher attendance = higher marks (with some variance)
    const baseMarks = (attendance * 0.85) + (Math.random() * 10);
    const marks = Math.min(95, Math.max(40, baseMarks));
    
    return {
      ...stat,
      marks: marks.toFixed(1),
      grade: marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : marks >= 60 ? 'B' : marks >= 50 ? 'C' : 'D'
    };
  }) || [];

  // Calculate overall marks
  const overallMarks = subjectsWithMarks.length > 0 
    ? (subjectsWithMarks.reduce((sum, s) => sum + parseFloat(s.marks), 0) / subjectsWithMarks.length).toFixed(1)
    : 0;

  // Attendance vs Marks correlation data
  const correlationData = subjectsWithMarks.map(s => ({
    subject: s.subject.substring(0, 12),
    attendance: parseFloat(s.percentage),
    marks: parseFloat(s.marks)
  }));

  // Monthly growth data (attendance + marks)
  const monthlyGrowthData = [
    { month: 'Aug', attendance: 72, marks: 65 },
    { month: 'Sep', attendance: 78, marks: 70 },
    { month: 'Oct', attendance: 75, marks: 68 },
    { month: 'Nov', attendance: 80, marks: 75 },
    { month: 'Dec', attendance: 82, marks: 78 },
    { month: 'Jan', attendance: parseFloat(overallPercentage), marks: parseFloat(overallMarks) }
  ];

  // Semester-wise growth (used in analytics)
  const semesterGrowthData = [
    { semester: 'Sem 1', attendance: 75, marks: 68, cgpa: 7.2 },
    { semester: 'Sem 2', attendance: parseFloat(overallPercentage), marks: parseFloat(overallMarks), cgpa: 7.8 }
  ];

  // Monthly trend data
  const monthlyTrendData = [
    { month: 'Aug', attendance: 72 },
    { month: 'Sep', attendance: 78 },
    { month: 'Oct', attendance: 75 },
    { month: 'Nov', attendance: 80 },
    { month: 'Dec', attendance: 82 },
    { month: 'Jan', attendance: parseFloat(overallPercentage) }
  ];

  // Class average comparison
  const classAverageData = stats?.attendanceStats.map(stat => ({
    subject: stat.subject.substring(0, 15),
    myAttendance: parseFloat(stat.percentage),
    classAverage: Math.max(65, parseFloat(stat.percentage) - Math.random() * 10)
  })) || [];

  // eslint-disable-next-line no-unused-vars
  const performanceData = stats?.attendanceStats.slice(0, 6).map(stat => ({
    subject: stat.subject.substring(0, 10),
    score: parseFloat(stat.percentage)
  })) || [];

  // Download report function
  const downloadReport = () => {
    const reportData = `
ATTENDANCE REPORT
=================
Student: ${user?.name}
Roll Number: ${user?.rollNumber}
Department: ${user?.department}
Generated: ${new Date().toLocaleDateString()}

OVERALL STATISTICS
------------------
Total Courses: ${stats?.totalClasses}
Total Classes: ${totalClasses}
Classes Attended: ${totalAttended}
Overall Percentage: ${overallPercentage}%

SUBJECT-WISE ATTENDANCE
-----------------------
${stats?.attendanceStats.map(stat => 
  `${stat.subject}: ${stat.percentage}% (${stat.attended}/${stat.total})`
).join('\n')}

---
This is an automated report generated by the Attendance Management System.
    `.trim();

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Report_${user?.rollNumber}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully!');
  };

  // Calculate rank (demo)
  const classRank = Math.floor(Math.random() * 15) + 1;
  const totalStudents = 73;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">
            {analysisMode === 'attendance' 
              ? 'Detailed insights into your attendance performance' 
              : 'Comprehensive analysis of your academic marks and grades'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Analysis Mode Toggle */}
          <div className="bg-white rounded-lg shadow-md p-2 flex items-center gap-2">
            <button
              onClick={() => setAnalysisMode('attendance')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                analysisMode === 'attendance'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiCheckCircle />
              Attendance Analysis
            </button>
            <button
              onClick={() => setAnalysisMode('marks')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                analysisMode === 'marks'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiAward />
              Marks Analysis
            </button>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <FiDownload />
            Download Report
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-4 mb-8 overflow-x-auto">
        {['overview', 'performance', 'insights'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedView === view
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {analysisMode === 'attendance' ? (
              <>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FiAward className="text-3xl" />
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Rank</span>
                  </div>
                  <p className="text-4xl font-bold mb-1">#{classRank}</p>
                  <p className="text-blue-100 text-sm">Out of {totalStudents} students</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FiTrendingUp className="text-3xl" />
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Trend</span>
                  </div>
                  <p className="text-4xl font-bold mb-1">+5.2%</p>
                  <p className="text-green-100 text-sm">vs last month</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FiUsers className="text-3xl" />
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Average</span>
                  </div>
                  <p className="text-4xl font-bold mb-1">{(parseFloat(overallPercentage) - 3).toFixed(1)}%</p>
                  <p className="text-purple-100 text-sm">Class average</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FiCheckCircle className="text-3xl" />
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Status</span>
                  </div>
                  <p className="text-4xl font-bold mb-1">{overallPercentage >= 75 ? 'Safe' : 'Risk'}</p>
                  <p className="text-orange-100 text-sm">Attendance status</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FiAward className="text-3xl" />
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Average</span>
                  </div>
                  <p className="text-4xl font-bold mb-1">{overallMarks}%</p>
                  <p className="text-green-100 text-sm">Overall Marks</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FiTrendingUp className="text-3xl" />
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">CGPA</span>
                  </div>
                  <p className="text-4xl font-bold mb-1">7.8</p>
                  <p className="text-blue-100 text-sm">Current Semester</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FiAward className="text-3xl" />
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Grade</span>
                  </div>
                  <p className="text-4xl font-bold mb-1">A</p>
                  <p className="text-purple-100 text-sm">Overall Grade</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FiUsers className="text-3xl" />
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Rank</span>
                  </div>
                  <p className="text-4xl font-bold mb-1">#{classRank}</p>
                  <p className="text-orange-100 text-sm">Class Position</p>
                </div>
              </>
            )}
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {analysisMode === 'attendance' ? 'Attendance Performance Summary' : 'Academic Performance Summary'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analysisMode === 'attendance' ? (
                <>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <p className="text-4xl font-bold text-green-600 mb-2">
                      {stats?.attendanceStats.filter(s => parseFloat(s.percentage) >= 85).length || 0}
                    </p>
                    <p className="text-gray-700 font-semibold">Excellent Subjects</p>
                    <p className="text-sm text-gray-500">≥85% attendance</p>
                  </div>
                  <div className="text-center p-6 bg-yellow-50 rounded-lg">
                    <p className="text-4xl font-bold text-yellow-600 mb-2">
                      {stats?.attendanceStats.filter(s => {
                        const p = parseFloat(s.percentage);
                        return p >= 75 && p < 85;
                      }).length || 0}
                    </p>
                    <p className="text-gray-700 font-semibold">Good Subjects</p>
                    <p className="text-sm text-gray-500">75-84% attendance</p>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <p className="text-4xl font-bold text-red-600 mb-2">
                      {stats?.attendanceStats.filter(s => parseFloat(s.percentage) < 75).length || 0}
                    </p>
                    <p className="text-gray-700 font-semibold">At Risk Subjects</p>
                    <p className="text-sm text-gray-500">&lt;75% attendance</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <p className="text-4xl font-bold text-green-600 mb-2">
                      {subjectsWithMarks.filter(s => parseFloat(s.marks) >= 80).length}
                    </p>
                    <p className="text-gray-700 font-semibold">Excellent Grades</p>
                    <p className="text-sm text-gray-500">A+ and A grades</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <p className="text-4xl font-bold text-blue-600 mb-2">
                      {subjectsWithMarks.filter(s => {
                        const m = parseFloat(s.marks);
                        return m >= 60 && m < 80;
                      }).length}
                    </p>
                    <p className="text-gray-700 font-semibold">Good Grades</p>
                    <p className="text-sm text-gray-500">B+ and B grades</p>
                  </div>
                  <div className="text-center p-6 bg-yellow-50 rounded-lg">
                    <p className="text-4xl font-bold text-yellow-600 mb-2">
                      {subjectsWithMarks.filter(s => parseFloat(s.marks) < 60).length}
                    </p>
                    <p className="text-gray-700 font-semibold">Needs Improvement</p>
                    <p className="text-sm text-gray-500">C and below</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Performance Section */}
      {selectedView === 'performance' && (
        <div className="space-y-6">
          {/* Attendance vs Marks Correlation - UNIQUE CHART */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Attendance vs Marks Correlation</h2>
            <p className="text-gray-600 mb-6">Analysis showing the relationship between your attendance and academic performance</p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#10B981" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="attendance" fill="#3B82F6" name="Attendance %" />
                <Bar yAxisId="right" dataKey="marks" fill="#10B981" name="Marks %" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                💡 <span className="font-semibold">Insight:</span> There's a strong positive correlation between attendance and marks. 
                Students with higher attendance tend to score better marks. Your current attendance of {overallPercentage}% 
                correlates with an average of {overallMarks}% marks.
              </p>
            </div>
          </div>

          {/* Monthly Growth Chart - UNIQUE TREND */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Monthly Progress: Attendance & Marks</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 6 }}
                  name="Attendance %"
                />
                <Line 
                  type="monotone" 
                  dataKey="marks" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 6 }}
                  name="Marks %"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-700">
                🌟 <span className="font-semibold">Excellent Progress!</span> Both your attendance and marks show consistent upward trends. 
                Keep maintaining this momentum!
              </p>
            </div>
          </div>

          {/* Subject-wise Performance Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subject-wise Performance Analysis</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Attendance</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Marks</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subjectsWithMarks.map((subject, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{subject.subject}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${
                          parseFloat(subject.percentage) >= 75 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {subject.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-blue-600">{subject.marks}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          subject.grade === 'A+' || subject.grade === 'A' ? 'bg-green-100 text-green-800' :
                          subject.grade === 'B+' || subject.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {subject.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {parseFloat(subject.marks) >= 70 ? (
                          <span className="text-green-600">✓ Excellent</span>
                        ) : parseFloat(subject.marks) >= 50 ? (
                          <span className="text-blue-600">○ Good</span>
                        ) : (
                          <span className="text-red-600">⚠ Needs Improvement</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Insights Section */}
      {selectedView === 'insights' && (
        <div className="space-y-6">
          {/* Growth Summary */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">📈 Your Academic Growth Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-purple-200 text-sm mb-1">Attendance Growth</p>
                <p className="text-4xl font-bold">+10%</p>
                <p className="text-purple-100 text-sm mt-1">Since August</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm mb-1">Marks Improvement</p>
                <p className="text-4xl font-bold">+13%</p>
                <p className="text-purple-100 text-sm mt-1">Since August</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm mb-1">CGPA Growth</p>
                <p className="text-4xl font-bold">+0.6</p>
                <p className="text-purple-100 text-sm mt-1">From Sem 1 to Sem 2</p>
              </div>
            </div>
          </div>

          {/* Achievement Milestones */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Achievement Milestones</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                <div className="text-3xl">✅</div>
                <div>
                  <p className="font-bold text-gray-900">Crossed 75% Attendance</p>
                  <p className="text-sm text-gray-600">Achieved in November 2025 - Eligible for exams!</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl">📚</div>
                <div>
                  <p className="font-bold text-gray-900">Consistent Improvement</p>
                  <p className="text-sm text-gray-600">5 months of continuous growth in both attendance and marks</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl">🎯</div>
                <div>
                  <p className="font-bold text-gray-900">CGPA Improvement</p>
                  <p className="text-sm text-gray-600">Increased from 7.2 to 7.8 - Keep it up!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Analysis */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🔮</span> Predictive Analysis
            </h3>
            <p className="text-gray-700 mb-4">Based on your current growth trajectory:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• If you maintain current attendance, you'll end semester with <span className="font-bold text-green-600">85%+</span> attendance</li>
              <li>• Your projected final marks average: <span className="font-bold text-blue-600">80-85%</span></li>
              <li>• Expected semester CGPA: <span className="font-bold text-purple-600">8.0-8.2</span></li>
              <li>• You're on track to achieve <span className="font-bold text-orange-600">A Grade</span> in most subjects</li>
            </ul>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎯</span> Strengths
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {subjectsWithMarks.filter(s => parseFloat(s.marks) >= 80).slice(0, 3).map((s, i) => (
                  <li key={i}>• <span className="font-semibold">{s.subject}</span> - {s.marks}% ({s.grade})</li>
                ))}
                {subjectsWithMarks.filter(s => parseFloat(s.marks) >= 80).length === 0 && (
                  <li>• Keep working hard to achieve excellence!</li>
                )}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>📈</span> Areas for Improvement
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {subjectsWithMarks.filter(s => parseFloat(s.marks) < 70).slice(0, 3).map((s, i) => (
                  <li key={i}>• <span className="font-semibold">{s.subject}</span> - {s.marks}% (Improve attendance: {s.percentage}%)</li>
                ))}
                {subjectsWithMarks.filter(s => parseFloat(s.marks) < 70).length === 0 && (
                  <li>• Great job! All subjects performing well!</li>
                )}
              </ul>
            </div>
          </div>

          {/* Class Rank Visualization */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏅 Class Ranking</h2>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    stroke="#E5E7EB"
                    strokeWidth="20"
                    fill="none"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    stroke="#10B981"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={`${(1 - classRank / totalStudents) * 628} 628`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-bold text-gray-900">{Math.floor((1 - classRank / totalStudents) * 100)}%</p>
                  <p className="text-gray-600 mt-2">Percentile</p>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-700 mt-4">
              You're ranked <span className="font-bold text-blue-600">#{classRank}</span> out of {totalStudents} students<br/>
              <span className="text-sm text-gray-500">Top {Math.ceil((classRank / totalStudents) * 100)}% of your class!</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
