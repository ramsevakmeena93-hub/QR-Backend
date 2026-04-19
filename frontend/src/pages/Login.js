import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from 'react-toastify';

const BRANCH_MAP = {
  tc: 'CST (Computer Science & Technology)',
  cs: 'CS (Computer Science)',
  it: 'IT (Information Technology)',
  ec: 'EC (Electronics & Communication)',
  me: 'ME (Mechanical Engineering)',
  ce: 'CE (Civil Engineering)',
  ee: 'EE (Electrical Engineering)',
  bt: 'BT (Biotechnology)',
};

const FACULTY_EMAILS = ['ramsevakmeena93@gmail.com'];
const STUDENT_DOMAIN = 'mitsgwl.ac.in';

function parseStudentEmail(email) {
  const local = email.split('@')[0].toLowerCase();
  const match = local.match(/^(\d{2})([a-z]+)(\d)([a-z]+)(\d+)$/);
  if (!match) return null;
  const [, yearStr, branchCode, section, initials, roll] = match;
  const admissionYear = 2000 + parseInt(yearStr);
  const currentYear = new Date().getFullYear();
  const yearOfStudy = Math.min(currentYear - admissionYear + 1, 4);
  const yearLabel = ['1st Year', '2nd Year', '3rd Year', '4th Year'][yearOfStudy - 1];
  const enrollmentNo = `${branchCode.toUpperCase()}${yearStr}O${section}${initials.toUpperCase()}${roll}`;
  return {
    admissionYear, branch: BRANCH_MAP[branchCode] || branchCode.toUpperCase(),
    branchCode: branchCode.toUpperCase(), section, initials: initials.toUpperCase(),
    roll, enrollmentNo, yearOfStudy, yearLabel,
  };
}

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const Login = () => {
  const { setGoogleUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture } = decoded;

      // Faculty check
      if (FACULTY_EMAILS.includes(email.toLowerCase())) {
        setGoogleUser({ id: email, name, email, picture, role: 'teacher', department: 'CST', loginMethod: 'google' });
        toast.success(`Welcome, ${name}! Logged in as Faculty.`);
        navigate('/teacher');
        return;
      }

      // Student check
      if (email.endsWith(`@${STUDENT_DOMAIN}`)) {
        const parsed = parseStudentEmail(email);
        if (!parsed) {
          toast.error('Could not parse your college email. Contact admin.');
          return;
        }
        setGoogleUser({
          id: email, name, email, picture, role: 'student',
          department: parsed.branchCode, enrollmentNo: parsed.enrollmentNo,
          branch: parsed.branch, branchCode: parsed.branchCode,
          section: parsed.section, admissionYear: parsed.admissionYear,
          yearOfStudy: parsed.yearOfStudy, yearLabel: parsed.yearLabel,
          roll: parsed.roll, loginMethod: 'google',
        });
        toast.success(`Welcome, ${name}!`);
        navigate('/student');
        return;
      }

      toast.error(`Access denied. Only @${STUDENT_DOMAIN} students and authorized faculty can login.`);
    } catch (err) {
      toast.error('Google login failed. Please try again.');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transition-colors duration-300">
          {/* Branding */}
          <div className="text-center mb-8">
            <img src="/mits-logo.png" alt="MITS Logo"
              className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-lg hover:rotate-12 transition-transform duration-300" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Madhav Institute of Technology & Science
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Attendance Management System</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in with your college Google account</p>
          </div>

          {/* Google Sign-In Only */}
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-In failed. Please try again.')}
              useOneTap
              theme="outline"
              size="large"
              width="360"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              📧 Students: use <strong>@mitsgwl.ac.in</strong> account<br />
              👨‍🏫 Faculty: use your authorized Gmail
            </p>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            Developed by <span className="text-blue-500 font-semibold">Ajay Meena</span>
            <br />
            Project Partner <span className="text-indigo-500 font-semibold">Mohammad Shafat Ali Khan</span>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
