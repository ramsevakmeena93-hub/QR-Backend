import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import QRScanner from './pages/QRScanner';
import TeacherClassManagement from './pages/TeacherClassManagement';
import StudentClassView from './pages/StudentClassView';
import ActivityLogDashboard from './pages/ActivityLogDashboard';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                <Route path="/admin/*" element={
                  <PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>
                } />

                <Route path="/admin/logs" element={
                  <PrivateRoute role="admin"><ActivityLogDashboard /></PrivateRoute>
                } />

                <Route path="/teacher/*" element={
                  <PrivateRoute role="teacher"><TeacherDashboard /></PrivateRoute>
                } />

                <Route path="/teacher/class/:classId" element={
                  <PrivateRoute role="teacher"><TeacherClassManagement /></PrivateRoute>
                } />

                <Route path="/student/*" element={
                  <PrivateRoute role="student"><StudentDashboard /></PrivateRoute>
                } />

                <Route path="/student/class/:classId" element={
                  <PrivateRoute role="student"><StudentClassView /></PrivateRoute>
                } />

                <Route path="/scan" element={
                  <PrivateRoute role="student"><QRScanner /></PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <ToastContainer position="top-right" autoClose={3000} />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
