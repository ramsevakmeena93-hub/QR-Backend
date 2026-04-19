import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiFile, FiStar, FiMessageSquare, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StudentClassView = () => {
  const { classId } = useParams();
  const [activeTab, setActiveTab] = useState('materials');
  const [classInfo, setClassInfo] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [myMarks, setMyMarks] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    teachingQuality: 5,
    contentClarity: 5,
    classroomEnvironment: 5,
    comments: '',
    suggestions: '',
    isAnonymous: false
  });

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    // Demo data
    setClassInfo({
      name: 'Data Structures 34251201',
      code: 'DS101',
      teacher: 'Dr. Devanshu Tiwari',
      description: 'Introduction to fundamental data structures and algorithms'
    });

    setMaterials([
      {
        _id: '1',
        title: 'Introduction to Data Structures',
        description: 'Basic concepts and overview',
        type: 'notes',
        fileName: 'ds_intro.pdf',
        fileSize: 2.5,
        uploadDate: new Date()
      },
      {
        _id: '2',
        title: 'Arrays and Linked Lists',
        description: 'Detailed study of linear data structures',
        type: 'notes',
        fileName: 'arrays_linkedlists.pdf',
        fileSize: 3.2,
        uploadDate: new Date()
      }
    ]);

    setMyMarks([
      {
        _id: '1',
        examType: 'quiz',
        examName: 'Quiz 1',
        marksObtained: 18,
        totalMarks: 20,
        percentage: 90,
        grade: 'A+',
        remarks: 'Excellent work!',
        examDate: new Date()
      },
      {
        _id: '2',
        examType: 'assignment',
        examName: 'Assignment 1',
        marksObtained: 45,
        totalMarks: 50,
        percentage: 90,
        grade: 'A+',
        examDate: new Date()
      }
    ]);
  };

  const handleDownload = (material) => {
    toast.success(`Downloading ${material.fileName}...`);
    // Implement actual download logic
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    toast.success('Feedback submitted successfully! Thank you for your input.');
    setShowFeedbackForm(false);
    setFeedbackForm({
      teachingQuality: 5,
      contentClarity: 5,
      classroomEnvironment: 5,
      comments: '',
      suggestions: '',
      isAnonymous: false
    });
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <FiStar
              className={`w-8 h-8 ${
                star <= value
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
          {value}/5
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Class Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {classInfo?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Instructor: {classInfo?.teacher} | Code: {classInfo?.code}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {['materials', 'marks', 'feedback'].map((tab) => (
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
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Study Materials ({materials.length})
            </h2>
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FiFile className="text-blue-600 text-2xl" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {material.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {material.description}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                          {material.type}
                        </span>
                        <span>{material.fileName}</span>
                        <span>{material.fileSize} MB</span>
                        <span>Uploaded: {new Date(material.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(material)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FiDownload /> Download
                    </button>
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
          {/* Overall Performance */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Average Percentage</p>
              <p className="text-4xl font-bold">
                {(myMarks.reduce((sum, m) => sum + parseFloat(m.percentage), 0) / myMarks.length).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Average Grade</p>
              <p className="text-4xl font-bold">A+</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Total Assessments</p>
              <p className="text-4xl font-bold">{myMarks.length}</p>
            </div>
          </div>

          {/* Marks List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              My Marks
            </h2>
            <div className="space-y-4">
              {myMarks.map((mark) => (
                <div
                  key={mark._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {mark.examName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {mark.examType}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-lg font-bold ${
                      mark.grade === 'A+' || mark.grade === 'A'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : mark.grade === 'B+' || mark.grade === 'B'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {mark.grade}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Marks Obtained</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mark.marksObtained}/{mark.totalMarks}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {mark.percentage}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {new Date(mark.examDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {mark.remarks && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Teacher's Remarks:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{mark.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          {!showFeedbackForm ? (
            <div className="text-center py-12">
              <FiMessageSquare className="text-6xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Share Your Feedback
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Help us improve by sharing your thoughts about this class
              </p>
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Give Feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Class Feedback Form
              </h2>

              <StarRating
                label="Teaching Quality"
                value={feedbackForm.teachingQuality}
                onChange={(value) => setFeedbackForm({ ...feedbackForm, teachingQuality: value })}
              />

              <StarRating
                label="Content Clarity"
                value={feedbackForm.contentClarity}
                onChange={(value) => setFeedbackForm({ ...feedbackForm, contentClarity: value })}
              />

              <StarRating
                label="Classroom Environment"
                value={feedbackForm.classroomEnvironment}
                onChange={(value) => setFeedbackForm({ ...feedbackForm, classroomEnvironment: value })}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comments
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="4"
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  placeholder="What did you like about this class?"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Suggestions for Improvement
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="4"
                  value={feedbackForm.suggestions}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, suggestions: e.target.value })}
                  placeholder="How can we make this class better?"
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackForm.isAnonymous}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, isAnonymous: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Submit anonymously
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Submit Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentClassView;
