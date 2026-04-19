import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiSave, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const ManualAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [qrGeneratedToday, setQrGeneratedToday] = useState(0);

  useEffect(() => {
    fetchClassData();
    checkQRGenerationCount();
  }, [classId, selectedDate]);

  const fetchClassData = async () => {
    try {
      // Fetch class info
      const classResponse = await axios.get(`/api/teacher/class/${classId}`);
      setClassInfo(classResponse.data.class);

      // Fetch all students
      const studentsResponse = await axios.get(`/api/teacher/class/${classId}/students`);
      setStudents(studentsResponse.data.students);

      // Fetch existing attendance for selected date
      try {
        const attendanceResponse = await axios.get(`/api/teacher/class/${classId}/attendance/${selectedDate}`);
        const existingAttendance = attendanceResponse.data.attendance;

        // Initialize attendance data
        const initialData = {};
        studentsResponse.data.students.forEach(student => {
          const existing = existingAttendance.find(att => att.student._id === student._id);
          initialData[student._id] = {
            status: existing ? existing.status : 'present',
            marked: !!existing
          };
        });
        setAttendanceData(initialData);
      } catch (error) {
        // No attendance for this date yet, initialize all as present
        const initialData = {};
        studentsResponse.data.students.forEach(student => {
          initialData[student._id] = {
            status: 'present',
            marked: false
          };
        });
        setAttendanceData(initialData);
      }
    } catch (error) {
      toast.error('Failed to load class data');
      console.error(error);
    }
  };

  const checkQRGenerationCount = async () => {
    try {
      const response = await axios.get(`/api/teacher/class/${classId}/qr-count`);
      setQrGeneratedToday(response.data.count);
    } catch (error) {
      console.error('Failed to fetch QR count');
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: prev[studentId].status === 'present' ? 'absent' : 'present',
        marked: true
      }
    }));
  };

  const markAllPresent = () => {
    const newData = {};
    students.forEach(student => {
      newData[student._id] = {
        status: 'present',
        marked: true
      };
    });
    setAttendanceData(newData);
    toast.success('All students marked present');
  };

  const markAllAbsent = () => {
    const newData = {};
    students.forEach(student => {
      newData[student._id] = {
        status: 'absent',
        marked: true
      };
    });
    setAttendanceData(newData);
    toast.success('All students marked absent');
  };

  const handleRollNumberAbsent = (rollNumbersInput) => {
    if (!rollNumbersInput.trim()) {
      toast.error('Please enter roll numbers');
      return;
    }

    // Check if students are loaded
    if (students.length === 0) {
      toast.error('Students not loaded yet. Please wait...');
      return;
    }

    // Parse input: "1,2,56,70" or "1, 2, 56, 70"
    const inputNumbers = rollNumbersInput.split(',').map(num => num.trim());
    const rollNumbers = inputNumbers
      .map(num => parseInt(num))
      .filter(num => !isNaN(num) && num >= 1 && num <= students.length);

    if (rollNumbers.length === 0) {
      toast.error(`No valid roll numbers found. Please enter numbers between 1 and ${students.length}`);
      return;
    }

    // Mark all as present first
    const newData = {};
    students.forEach(student => {
      newData[student._id] = {
        status: 'present',
        marked: true
      };
    });

    // Mark specified roll numbers as absent
    rollNumbers.forEach(rollNum => {
      const studentIndex = rollNum - 1; // Convert to 0-based index
      if (studentIndex >= 0 && studentIndex < students.length) {
        const student = students[studentIndex];
        newData[student._id] = {
          status: 'absent',
          marked: true
        };
      }
    });

    setAttendanceData(newData);
    const absentCount = rollNumbers.length;
    const presentCount = students.length - absentCount;
    toast.success(`Roll numbers ${rollNumbers.join(', ')} marked absent. Present: ${presentCount}, Absent: ${absentCount}`);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const presentStudents = [];
      const absentStudents = [];

      students.forEach(student => {
        if (attendanceData[student._id]?.status === 'present') {
          presentStudents.push(student._id);
        } else {
          absentStudents.push(student._id);
        }
      });

      // API call
      await axios.post(`/api/teacher/class/${classId}/manual-attendance`, {
        attendanceDate: selectedDate,
        presentStudents,
        absentStudents
      });

      toast.success(`Attendance submitted! Present: ${presentStudents.length}, Absent: ${absentStudents.length}`);
      
      // Refresh data
      fetchClassData();
    } catch (error) {
      toast.error('Failed to submit attendance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendanceData).filter(a => a.status === 'present').length;
  const absentCount = Object.values(attendanceData).filter(a => a.status === 'absent').length;

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Back Button */}
      <button
        onClick={() => navigate('/teacher/classes')}
        className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
      >
        <FiArrowLeft /> Back to Classes
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manual Attendance
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {classInfo?.name} | {students.length > 0 ? `${students.length} Students` : 'Loading students...'}
            </p>
            {students.length === 0 && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                ⏳ Please wait while students are loading...
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              QR Codes Generated Today
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {qrGeneratedToday}/3
            </p>
            {qrGeneratedToday >= 3 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Daily limit reached
              </p>
            )}
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-4 mb-4">
          <FiCalendar className="text-gray-600 dark:text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="text-gray-600 dark:text-gray-400">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-center">
            <FiUsers className="text-3xl text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {students.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center">
            <FiCheck className="text-3xl text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {presentCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4 text-center">
            <FiX className="text-3xl text-red-600 dark:text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {absentCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        
        {/* First Row - Mark All Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={markAllPresent}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiCheck /> Mark All Present
          </button>
          <button
            onClick={markAllAbsent}
            className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiX /> Mark All Absent
          </button>
        </div>

        {/* Roll Number Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Roll Numbers of Absent Students {students.length > 0 && `(1-${students.length})`}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={students.length > 0 ? `e.g., 1, 2, 56, ${students.length}` : "Loading students..."}
              disabled={students.length === 0}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRollNumberAbsent(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousSibling;
                handleRollNumberAbsent(input.value);
                input.value = '';
              }}
              disabled={students.length === 0}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {students.length > 0 
              ? `Comma-separated roll numbers (1-${students.length}). All other students will be marked present.`
              : 'Waiting for students to load...'}
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FiSave /> {loading ? 'Submitting...' : 'Submit Attendance'}
        </button>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
            💡 Quick Tips:
          </p>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Click student cards to toggle present/absent</li>
            <li>• Enter roll numbers (e.g., 1, 2, 56, 70) to mark specific students absent</li>
            <li>• All other students will be automatically marked present</li>
            <li>• Review the absent students summary before submitting</li>
          </ul>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Student Attendance List
        </h2>

        {/* Absent Students Summary */}
        {absentCount > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-3">
              📋 Absent Students ({absentCount})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {students
                .map((student, index) => ({ student, index }))
                .filter(({ student }) => attendanceData[student._id]?.status === 'absent')
                .map(({ student, index }) => (
                  <div key={student._id} className="text-sm text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 px-3 py-2 rounded border border-red-300 dark:border-red-700">
                    <span className="font-bold">Roll #{index + 1}:</span> {student.name}
                    <span className="block text-xs text-gray-600 dark:text-gray-400">{student.rollNumber}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student, index) => (
            <div
              key={student._id}
              onClick={() => toggleAttendance(student._id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-105 ${
                attendanceData[student._id]?.status === 'present'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900'
                  : 'border-red-500 bg-red-50 dark:bg-red-900'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {index + 1}. {student.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {student.rollNumber}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  attendanceData[student._id]?.status === 'present'
                    ? 'bg-green-600'
                    : 'bg-red-600'
                }`}>
                  {attendanceData[student._id]?.status === 'present' ? (
                    <FiCheck className="text-white" />
                  ) : (
                    <FiX className="text-white" />
                  )}
                </div>
              </div>
              <p className={`text-xs font-semibold ${
                attendanceData[student._id]?.status === 'present'
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {attendanceData[student._id]?.status === 'present' ? 'PRESENT' : 'ABSENT'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button (Bottom) */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full hover:shadow-2xl transition-all transform hover:scale-110 flex items-center gap-3 text-lg font-semibold disabled:opacity-50"
        >
          <FiSave className="text-2xl" />
          {loading ? 'Submitting...' : `Submit (${presentCount}P / ${absentCount}A)`}
        </button>
      </div>
    </div>
  );
};

export default ManualAttendance;
