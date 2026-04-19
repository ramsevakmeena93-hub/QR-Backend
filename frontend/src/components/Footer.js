import React from 'react';
import { FiHeart, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              © 2026 Madhav Institute of Technology & Science. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Developed with</span>
            <FiHeart className="text-red-500 animate-pulse" />
            <span className="text-gray-400">by</span>
            <span className="text-blue-400 font-bold">Ajay Meena</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
