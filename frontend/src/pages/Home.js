import React, { useContext, useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { FiCheckCircle, FiClock, FiShield, FiSmartphone, FiUsers, FiTrendingUp, FiAward, FiBarChart, FiZap, FiTarget, FiStar } from 'react-icons/fi';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, attendance: 0 });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    // Animate stats on load
    const animateValue = (key, end, duration) => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setStats(prev => ({ ...prev, [key]: end }));
          clearInterval(timer);
        } else {
          setStats(prev => ({ ...prev, [key]: Math.floor(start) }));
        }
      }, 16);
    };

    animateValue('students', 70, 2000);
    animateValue('teachers', 11, 2000);
    animateValue('classes', 150, 2000);
    animateValue('attendance', 4526, 2000);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (user) {
    return <Navigate to={`/${user.role}`} />;
  }

  const testimonials = [
    {
      name: "Dr. Devanshu Tiwari",
      role: "Faculty, CST Department",
      text: "This system has revolutionized how we track attendance. The QR code feature is incredibly efficient!",
      rating: 5
    },
    {
      name: "Ajay Meena",
      role: "Student, BTTC25O1002",
      text: "I love how easy it is to mark attendance. The analytics help me track my performance effectively.",
      rating: 5
    },
    {
      name: "Admin Department",
      role: "MITS Administration",
      text: "Comprehensive reports and real-time data have made attendance management seamless.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/mits-logo.png" 
                alt="MITS Logo" 
                className="w-12 h-12 object-contain transform hover:scale-110 transition-transform"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Madhav Institute of Technology & Science</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors">Smart Attendance Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-semibold">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-6 animate-bounce-slow">
            <img 
              src="/mits-logo.png" 
              alt="MITS Logo" 
              className="w-32 h-32 object-contain mx-auto drop-shadow-2xl transform hover:rotate-12 transition-transform duration-300"
            />
          </div>
          <h2 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            Madhav Institute of Technology & Science
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <FiZap className="text-yellow-500 animate-pulse" />
            <p className="text-2xl text-gray-700 dark:text-gray-300 font-semibold transition-colors">
              QR Code Based Attendance Management System
            </p>
            <FiZap className="text-yellow-500 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto transition-colors">
            Secure, fast, and reliable attendance tracking for the modern educational institution. 
            Real-time monitoring, instant reports, and seamless integration.
          </p>
        </div>

        {/* Live Stats with Pulse Animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <StatCard
            icon={FiUsers}
            value={stats.students}
            label="Active Students"
            color="from-blue-500 to-blue-600"
            delay="0"
          />
          <StatCard
            icon={FiAward}
            value={stats.teachers}
            label="Faculty Members"
            color="from-green-500 to-green-600"
            delay="100"
          />
          <StatCard
            icon={FiBarChart}
            value={stats.classes}
            label="Classes Conducted"
            color="from-purple-500 to-purple-600"
            delay="200"
          />
          <StatCard
            icon={FiTrendingUp}
            value={stats.attendance}
            label="Total Attendance"
            color="from-orange-500 to-orange-600"
            delay="300"
          />
        </div>

        {/* Features Grid with Hover Effects */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10 transition-colors">
            Why Choose Our System?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={FiCheckCircle}
              title="Easy to Use"
              description="Simple QR code scanning for instant attendance marking in seconds"
              color="blue"
            />
            <FeatureCard
              icon={FiClock}
              title="Real-time Updates"
              description="Live attendance tracking with instant notifications and reports"
              color="green"
            />
            <FeatureCard
              icon={FiShield}
              title="Secure & Reliable"
              description="JWT authentication with time-limited QR codes for maximum security"
              color="purple"
            />
            <FeatureCard
              icon={FiSmartphone}
              title="Mobile Friendly"
              description="Works seamlessly on all devices - phones, tablets, and desktops"
              color="orange"
            />
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10 transition-colors">
            What Our Users Say
          </h3>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-500 transform hover:scale-105">
              <div className="flex items-center justify-center mb-4">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <FiStar key={i} className="text-yellow-400 fill-current w-6 h-6" />
                ))}
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 text-center mb-6 italic">
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">{testimonials[activeTestimonial].name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{testimonials[activeTestimonial].role}</p>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeTestimonial 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard
              icon={FiTarget}
              title="99.9% Accuracy"
              description="Precise attendance tracking with minimal errors"
            />
            <BenefitCard
              icon={FiZap}
              title="Lightning Fast"
              description="Mark attendance in under 3 seconds"
            />
            <BenefitCard
              icon={FiAward}
              title="Award Winning"
              description="Trusted by leading institutions"
            />
          </div>
        </div>

        {/* CTA Section with Animation */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center text-white transform hover:scale-105 transition-all duration-300">
          <h3 className="text-4xl font-bold mb-4 animate-pulse">Ready to Get Started?</h3>
          <p className="text-xl mb-8 text-blue-100">
            Join Madhav Institute's smart attendance system today
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-110 hover:-translate-y-1"
            >
              Login to Get Started →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 mt-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Madhav Institute of Technology & Science</h4>
              <p className="text-gray-400 text-sm">
                Leading institution in technical education, committed to excellence in learning and innovation.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">
                Madhav Institute of Technology & Science<br />
                Gwalior, Madhya Pradesh<br />
                Email: info@mits.ac.in
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 Madhav Institute of Technology & Science. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Developed with ❤️ by <span className="text-blue-400 font-semibold">Ajay Meena</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color, delay }) => (
  <div 
    className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white transform hover:scale-110 transition-all duration-300 hover:shadow-2xl`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <Icon className="text-3xl mb-2 opacity-80 animate-pulse" />
    <p className="text-4xl font-bold mb-1">{value.toLocaleString()}</p>
    <p className="text-sm opacity-90">{label}</p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2 duration-300 group">
      <div className={`bg-gradient-to-br ${colorClasses[color]} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:rotate-12 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 transition-colors">{description}</p>
    </div>
  );
};

const BenefitCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{title}</h4>
    <p className="text-gray-600 dark:text-gray-400 transition-colors">{description}</p>
  </div>
);

export default Home;
