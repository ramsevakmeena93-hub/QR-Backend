import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { toast } from "react-toastify";
import axios from "axios";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
const STUDENT_DOMAIN = "mitsgwl.ac.in";
const BRANCH_MAP = { tc:"CST",cs:"CS",it:"IT",ec:"EC",me:"ME",ce:"CE",ee:"EE",bt:"BT" };

function parseStudentEmail(email) {
  const local = email.split("@")[0].toLowerCase();
  const match = local.match(/^(\d{2})([a-z]+)(\d)([a-z]+)(\d+)$/);
  if (!match) return null;
  const [, yearStr, branchCode, section, initials, roll] = match;
  const admissionYear = 2000 + parseInt(yearStr);
  const yearOfStudy = Math.min(new Date().getFullYear() - admissionYear + 1, 4);
  const enrollmentNo = `${branchCode.toUpperCase()}${yearStr}O${section}${initials.toUpperCase()}${roll}`;
  return { admissionYear, branchCode: branchCode.toUpperCase(), section, roll, enrollmentNo, yearOfStudy, branch: BRANCH_MAP[branchCode] || branchCode.toUpperCase() };
}

const Login = () => {
  const { login, setGoogleUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email: gEmail, name, picture, sub } = decoded;
      const emailLower = gEmail.toLowerCase();

      try {
        const user = await login(emailLower, `google_${sub}`);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(`/${user.role}`);
        return;
      } catch {}

      let role = "student";
      let extra = {};
      if (emailLower.endsWith(`@${STUDENT_DOMAIN}`)) {
        const parsed = parseStudentEmail(emailLower);
        if (parsed) extra = { rollNumber: parsed.enrollmentNo, branch: parsed.branch, section: parsed.section, admissionYear: parsed.admissionYear, yearOfStudy: parsed.yearOfStudy, department: parsed.branchCode };
      } else {
        role = "teacher";
        extra = { department: "CST" };
      }

      const res = await axios.post("/api/auth/register", { name, email: emailLower, password: `google_${sub}`, role, ...extra, loginMethod: "google", picture });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setGoogleUser({ ...user, picture, loginMethod: "google" });
      toast.success(`Welcome, ${name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-10 text-center">
            <img src="/mits-logo.png" alt="MITS Logo" className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-lg" />
            <h1 className="text-white font-bold text-base leading-tight">Madhav Institute of Technology & Science</h1>
            <p className="text-blue-200 text-xs mt-1">Attendance Management System</p>
          </div>
          <div className="px-6 py-8 -mt-4 bg-white dark:bg-gray-900 rounded-t-3xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">Sign in with your Google account</p>
            <div className="flex justify-center mb-4">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-500 py-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Signing in...</span>
                </div>
              ) : (
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Sign-In failed.")} useOneTap theme="outline" size="large" width="300" text="signin_with" shape="rectangular" />
              )}
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                Students: use <strong>@mitsgwl.ac.in</strong> account<br />Faculty: use your authorized Gmail
              </p>
            </div>
            <p className="text-center text-gray-400 text-xs">
              Developed by <span className="text-blue-500 font-semibold">Ajay Meena</span> &amp; <span className="text-indigo-500 font-semibold">Mohammad Shafat Ali Khan</span>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
