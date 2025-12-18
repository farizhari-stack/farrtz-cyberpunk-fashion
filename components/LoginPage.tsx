
import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { PageType, User } from '../types';
import ForgotPasswordModal from './ForgotPasswordModal';
import { authService } from '../services/auth';

const motion = framerMotion as any;

interface LoginPageProps {
  onNavigate: (page: PageType) => void;
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#1e1b4b]">
      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />

      {/* Left Side - Cyberpunk Robot Image */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-black">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="/cyberpunk-robot.png"
          alt="Cyberpunk Robot"
          className="object-cover w-full h-full opacity-90"
          style={{ transform: 'scaleX(-1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1e1b4b]"></div>
        <div className="absolute bottom-10 left-10 text-white z-10">
          <div className="h-1 w-20 bg-cyan-500 mb-4"></div>
          <h2 className="text-4xl font-bold brand-font mb-2">FUTURE READY</h2>
          <p className="tech-font text-gray-300">Equip yourself with the latest tech-wear.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 relative">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="flex justify-between items-start">
            <div
              className="flex items-center gap-2 cursor-pointer group mb-8"
              onClick={() => onNavigate('home')}
            >
              <img
                src="/logo-farrtz.png"
                alt="FARRTZ Logo"
                className="w-16 h-16 object-contain drop-shadow-lg"
              />
              <span className="text-2xl font-black brand-font text-white italic">FARRTZ</span>
            </div>

            <p className="text-xs text-gray-400 tech-font">
              Don't have a Farrtz account? <br />
              <button
                onClick={() => onNavigate('register')}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline decoration-cyan-500/30 hover:decoration-cyan-300"
              >
                Sign Up
              </button>
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white brand-font tracking-wide">Welcome Back!</h2>
            <p className="mt-2 text-sm text-gray-400 tech-font">Enter the mainframe to continue.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white border border-gray-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="cyber@punk.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white border border-gray-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.5)] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? 'Accessing...' : 'Login'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors underline decoration-gray-600"
              >
                Forgot My Password
              </button>
            </div>
          </form>
        </motion.div>

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default LoginPage;
