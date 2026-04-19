import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiUpload, FiFile, FiEdit, FiTrash2, FiStar, FiMessageSquare, FiBook, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';

const TeacherClassManagement = () => {
  const { classId } = useParams();
  const [activeTab, setActiveTab] = useState('materials');
  const [classInfo, setClassInfo] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [marks, setMarks] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [students, setStudents] = useState([]);

  // Material upload state
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    type: 'notes',
    file: null
  });

  // Marks entry state
  const [marksForm, setMarksForm] = useState({
    studentId: '',
    examType: 'quiz',
    examName: '',
    marksObtained: '',
    totalMarks: '',
    remarks: ''
  });

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    // Demo data - replace with actual API calls
    setClassInfo({
      name: 'Data Structures 34251201',
      code: 'DS101',
      students: 70
    });

    setStudents([
      { _id: '1', name: 'AJAY MEENA', rollNumber: 'BTTC25O1002' },
      { _id: '2', name: 'AAYUSH DEHARIYA', rollNumber: 'BTTC25O1003' },
      // Add more students
    ]);

    setMaterials([
      {
        _id: '1',
        title: 'Introduction to Data Structures',
        description: 'Basic concepts and overview',
        type: 'notes',
        fileName: 'ds_intro.pdf',
        fileSize: 2.5,
        uploadDate: new Date()
      }
    ]);

    setMarks([
      {
        _id: '1',
        student: { name: 'AJAY MEENA', rollNumber: 'BTTC25O1002' },
        examType: 'quiz',
        examName: 'Quiz 1',
        marksObtained: 18,
        totalMarks: 20,
        percentage: 90,
        grade: 'A+'
      }
    ]);

    setFeedback([
      {
        _id: '1',
        student: { name: 'AJAY MEENA', rollNumber: 'BTTC25O1002' },
        teachingQuality: 5,
        contentClarity: 4,
        classroomEnvironment: 5,
        overallRating: 4.7,
        comments: 'Excellent teaching method!',
        isAnonymous: false,
        submittedAt: new Date()
      }
    ]);
  };

  const handleMaterialUpload = async (e) => {
    e.preventDefault();
    toast.success('Material uploaded successfully!');
    setMaterialForm({ title: '', description: '', type: 'notes', file: null });
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    toast.success('Marks added successfully!');
    setMarksForm({
      studentId: '',
      examType: 'quiz',
      examName: '',
      marksObtained: '',
      totalMarks: '',
      remarks: ''
    });
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Class Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {classInfo?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Class Code: {classInfo?.code} | {classInfo?.students} Students
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {['materials', 'marks', 'feedback', 'details'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab === 'materials' && <FiFile className="inline mr-2" />}
            {tab === 'marks' && <FiAward className="inline mr-2" />}
            {tab === 'feedback' && <FiMessageSquare className="inline mr-2" />}
            {tab === 'details' && <FiBook className="inline mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Upload Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Study Material
            </h2>
            <form onSubmit={handleMaterialUpload} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    placeholder="e.g., Chapter 1 Notes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={materialForm.type}
                    onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                  >
                    <option value="notes">Notes</option>
                    <option value="assignment">Assignment</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="reference">Reference Material</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  placeholder="Brief description of the material"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files[0] })}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiUpload /> Upload Material
              </button>
            </form>
          </div>

          {/* Materials List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Uploaded Materials ({materials.length})
            </h2>
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {material.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {material.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {material.type}
                        </span>
                        <span>{material.fileName}</span>
                        <span>{material.fileSize} MB</span>
                        <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded">
                        <FiEdit />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Marks Tab */}
      {activeTab === 'marks' && (
        <div className="space-y-6">
          {/* Marks Entry Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add Student Marks
            </h2>
            <form onSubmit={handleMarksSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Student
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={marksForm.studentId}
                    onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })}
                  >
                    <option value="">Choose student...</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.rollNumber} - {student.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Type
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={marksForm.examType}
                    onChange={(e) => setMarksForm({ ...marksForm, examType: e.target.value })}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final Exam</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exam Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={marksForm.examName}
                  onChange={(e) => setMarksForm({ ...marksForm, examName: e.target.value })}
                  placeholder="e.g., Quiz 1, Assignment 2"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marks Obtained
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={marksForm.marksObtained}
                    onChange={(e) => setMarksForm({ ...marksForm, marksObtained: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={marksForm.totalMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, totalMarks: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="2"
                  value={marksForm.remarks}
                  onChange={(e) => setMarksForm({ ...marksForm, remarks: e.target.value })}
                  placeholder="Any comments or feedback"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Marks
              </button>
            </form>
          </div>

          {/* Marks List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Student Marks ({marks.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Exam
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Marks
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Percentage
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {marks.map((mark) => (
                    <tr key={mark._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div>
                          <p className="font-semibold">{mark.student.name}</p>
                          <p className="text-gray-500 dark:text-gray-400">{mark.student.rollNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div>
                          <p className="font-semibold">{mark.examName}</p>
                          <p className="text-gray-500 dark:text-gray-400">{mark.examType}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                        {mark.marksObtained}/{mark.totalMarks}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                        {mark.percentage}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          mark.grade === 'A+' || mark.grade === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          mark.grade === 'B+' || mark.grade === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Student Feedback ({feedback.length})
          </h2>
          <div className="space-y-4">
            {feedback.map((fb) => (
              <div
                key={fb._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {fb.isAnonymous ? 'Anonymous Student' : fb.student.name}
                    </p>
                    {!fb.isAnonymous && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{fb.student.rollNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiStar className="text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {fb.overallRating}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Teaching Quality</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {fb.teachingQuality}/5
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Content Clarity</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {fb.contentClarity}/5
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Environment</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {fb.classroomEnvironment}/5
                    </p>
                  </div>
                </div>
                {fb.comments && (
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Comments:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">{fb.comments}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Submitted: {new Date(fb.submittedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Details Tab */}
      {activeTab === 'details' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Course Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Description
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="4"
                placeholder="Enter course description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Learning Objectives
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="4"
                placeholder="Enter learning objectives..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prerequisites
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Basic Programming, Mathematics"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Update Course Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClassManagement;
