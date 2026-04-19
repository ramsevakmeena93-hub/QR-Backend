import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiX, FiStar, FiCamera, FiAlertCircle } from 'react-icons/fi';

const QRScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [success, setSuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const navigate = useNavigate();

  const [feedbackForm, setFeedbackForm] = useState({
    teachingQuality: 5,
    contentClarity: 5,
    classroomEnvironment: 5,
    comments: '',
    suggestions: '',
    isAnonymous: false
  });

  // Start camera
  useEffect(() => {
    if (scanning) {
      startCamera();
    }
    return () => stopCamera();
  }, [scanning]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          scanFrame();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Could not access camera: ' + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      handleScan(code.data);
    } else {
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  const handleScan = async (data) => {
    if (!data || !scanning) return;
    setScanning(false);
    stopCamera();

    try {
      let qrData;
      try { qrData = JSON.parse(data); } catch { qrData = { token: data }; }

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const response = await axios.post('/api/attendance/mark', {
        token: qrData.token,
        studentId: user?.id || '3',
        location: null,
        deviceInfo: { userAgent: navigator.userAgent }
      });

      setSuccess(true);
      setAttendanceData(response.data.attendance);
      toast.success(response.data.message || 'Attendance marked!');

      setTimeout(() => {
        setSuccess(false);
        setShowFeedback(true);
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
      setScanning(true);
      startCamera();
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/feedback/submit', {
        ...feedbackForm,
        classId: attendanceData?.class,
        attendanceId: attendanceData?._id
      });
      toast.success('Thank you for your feedback!');
      setTimeout(() => navigate('/student'), 1500);
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="flex gap-2 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110">
            <FiStar className={`w-8 h-8 ${star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
          </button>
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">{value}/5</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full">

        {/* Scanner View */}
        {!success && !showFeedback && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <FiCamera className="text-blue-600 w-6 h-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scan QR Code</h2>
              </div>
              <button onClick={() => navigate('/student')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Camera Error */}
            {cameraError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-red-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 dark:text-red-300 font-medium text-sm">{cameraError}</p>
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                      To fix: Click the camera icon in your browser's address bar and allow access.
                    </p>
                    <button onClick={startCamera}
                      className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Feed */}
            <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3' }}>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning overlay */}
              {cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-56 h-56">
                    {/* Corner borders */}
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                    {/* Scanning line animation */}
                    <div className="absolute left-2 right-2 h-0.5 bg-blue-400 opacity-80 animate-bounce" style={{ top: '50%' }} />
                  </div>
                </div>
              )}

              {/* Loading state */}
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center text-white">
                    <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm">Starting camera...</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              Point your camera at the teacher's QR code
            </p>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                ⏱️ QR code is valid for only <strong>8 seconds</strong> — scan quickly!
              </p>
            </div>
          </>
        )}

        {/* Success View */}
        {success && (
          <div className="text-center py-12">
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Attendance Marked! ✓
            </h3>
            <p className="text-gray-500 dark:text-gray-400">Loading feedback form...</p>
          </div>
        )}

        {/* Feedback Form */}
        {showFeedback && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Class Feedback</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Help us improve</p>
              </div>
              <button onClick={() => navigate('/student')} className="text-sm text-gray-500 hover:text-gray-700">
                Skip →
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <StarRating label="Teaching Quality" value={feedbackForm.teachingQuality}
                onChange={(v) => setFeedbackForm({ ...feedbackForm, teachingQuality: v })} />
              <StarRating label="Content Clarity" value={feedbackForm.contentClarity}
                onChange={(v) => setFeedbackForm({ ...feedbackForm, contentClarity: v })} />
              <StarRating label="Classroom Environment" value={feedbackForm.classroomEnvironment}
                onChange={(v) => setFeedbackForm({ ...feedbackForm, classroomEnvironment: v })} />

              <textarea rows="3" placeholder="Comments (optional)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                value={feedbackForm.comments}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })} />

              <div className="flex items-center gap-2">
                <input type="checkbox" id="anon" checked={feedbackForm.isAnonymous}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded" />
                <label htmlFor="anon" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Submit anonymously
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                  Submit Feedback
                </button>
                <button type="button" onClick={() => navigate('/student')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Skip
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
