import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { FiUsers, FiBook, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 p-8 bg-gray-50">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/students" element={<Students />} />
          <Route path="/subjects" element={<Subjects />} />
        </Routes>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Teachers"
          value={stats?.stats.totalTeachers || 0}
          icon={FiUsers}
          color="primary"
        />
        <StatCard
          title="Total Students"
          value={stats?.stats.totalStudents || 0}
          icon={FiUsers}
          color="secondary"
        />
        <StatCard
          title="Total Classes"
          value={stats?.stats.totalClasses || 0}
          icon={FiBook}
          color="warning"
        />
        <StatCard
          title="Total Attendance"
          value={stats?.stats.totalAttendance || 0}
          icon={FiCheckCircle}
          color="primary"
        />
      </div>

      {stats?.lowAttendanceStudents?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <FiAlertCircle className="text-red-500 w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Low Attendance Alert</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.lowAttendanceStudents.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.student.rollNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.student.department}</td>
                    <td className="px-4 py-3">
                      <span className="text-red-600 font-semibold">{item.percentage}%</span>
                      <span className="text-gray-500 text-sm ml-2">
                        ({item.attended}/{item.total})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', employeeId: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const response = await axios.get('/api/admin/teachers');
    setTeachers(response.data.teachers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/teacher', formData);
      toast.success('Teacher added successfully');
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', department: '', employeeId: '' });
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add teacher');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Teacher
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              required
              className="px-4 py-2 border rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              required
              className="px-4 py-2 border rounded-lg"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="px-4 py-2 border rounded-lg"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <input
              type="text"
              placeholder="Department"
              required
              className="px-4 py-2 border rounded-lg"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <input
              type="text"
              placeholder="Employee ID"
              required
              className="px-4 py-2 border rounded-lg"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            />
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">
              Add Teacher
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Employee ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher._id}>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{teacher.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{teacher.employeeId}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{teacher.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Students = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const response = await axios.get('/api/admin/students');
    setStudents(response.data.students);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Students</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Roll Number</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id}>
                <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.rollNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', code: '', department: '', credits: '', description: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const response = await axios.get('/api/admin/subjects');
    setSubjects(response.data.subjects);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/subject', formData);
      toast.success('Subject created successfully');
      setShowForm(false);
      setFormData({ name: '', code: '', department: '', credits: '', description: '' });
      fetchSubjects();
    } catch (error) {
      toast.error('Failed to create subject');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Subject
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Subject Name"
              required
              className="px-4 py-2 border rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Subject Code"
              required
              className="px-4 py-2 border rounded-lg"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            <input
              type="text"
              placeholder="Department"
              required
              className="px-4 py-2 border rounded-lg"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <input
              type="number"
              placeholder="Credits"
              required
              className="px-4 py-2 border rounded-lg"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              className="px-4 py-2 border rounded-lg col-span-2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">
              Add Subject
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Credits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subjects.map((subject) => (
              <tr key={subject._id}>
                <td className="px-6 py-4 text-sm text-gray-900">{subject.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{subject.code}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{subject.department}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{subject.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
