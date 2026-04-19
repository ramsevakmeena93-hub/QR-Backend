import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiBook, FiBarChart2, FiLogOut, FiGrid, FiCamera, FiTrendingUp } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { path: '/admin', icon: FiHome, label: 'Dashboard' },
          { path: '/admin/teachers', icon: FiUsers, label: 'Teachers' },
          { path: '/admin/students', icon: FiUsers, label: 'Students' },
          { path: '/admin/subjects', icon: FiBook, label: 'Subjects' },
          { path: '/admin/attendance', icon: FiBarChart2, label: 'Attendance' },
        ];
      case 'teacher':
        return [
          { path: '/teacher', icon: FiHome, label: 'Dashboard' },
          { path: '/teacher/classes', icon: FiGrid, label: 'My Classes' },
          { path: '/teacher/analytics', icon: FiTrendingUp, label: 'Analytics' },
          { path: '/teacher/reports', icon: FiBarChart2, label: 'Exam Reports' },
        ];
      case 'student':
        return [
          { path: '/student', icon: FiHome, label: 'Dashboard' },
          { path: '/student/classes', icon: FiGrid, label: 'My Classes' },
          { path: '/scan', icon: FiCamera, label: 'Scan QR' },
          { path: '/student/attendance', icon: FiBarChart2, label: 'My Attendance' },
          { path: '/student/analytics', icon: FiTrendingUp, label: 'Analytics' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 min-h-screen p-4 shadow-2xl">
      {/* College Branding */}
      <div className="mb-8 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <img 
            src="/mits-logo.png" 
            alt="MITS Logo" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-white">MITS</h1>
            <p className="text-xs text-gray-400">Attendance System</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 capitalize bg-gray-800 px-3 py-1 rounded-full inline-block">
          {role} Portal
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white w-full transition-all mt-8"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>

      {/* Footer in Sidebar */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-xs text-gray-500">
          Developed by<br/>
          <span className="text-blue-400 font-semibold">Ajay Meena</span>
          <br/>
          <span className="text-indigo-400 font-semibold">Mohammad Shafat Ali Khan</span>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
