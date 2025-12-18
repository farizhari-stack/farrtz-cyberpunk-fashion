
import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { PageType, User } from '../types';
import { authService } from '../services/supabaseAuth';
import { CheckCircle } from 'lucide-react';

const motion = framerMotion as any;

interface RegisterPageProps {
  onNavigate: (page: PageType) => void;
  onLoginSuccess: (user: User) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const result = await authService.register(firstName, lastName, email, password);

      if (result.success) {
        setSuccessMsg('Account created successfully! Redirecting to login...');
        // Wait 2 seconds then redirect to login
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#1a0f0f]">
      {/* Left Side - Cyberpunk Street Scene */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-black">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="/cyberpunk-street.jpg"
          alt="Cyberpunk Street Fashion"
          className="object-cover w-full h-full opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a0f0f]"></div>

        {/* Neon Sign Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-6xl font-black brand-font text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-orange-600 filter drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
            JOIN THE<br />REVOLUTION
          </h1>
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
              Already have an account? <br />
              <button
                onClick={() => onNavigate('login')}
                className="text-orange-400 hover:text-orange-300 font-bold underline decoration-orange-500/30 hover:decoration-orange-300"
              >
                Login
              </button>
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white brand-font tracking-wide">Create Your Account</h2>
            <p className="mt-2 text-sm text-gray-400 tech-font">Start your journey in 2077.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm px-4 py-2 rounded">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-500/20 border border-green-500 text-green-200 text-sm px-4 py-3 rounded flex items-center gap-2">
                <CheckCircle size={16} />
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white border border-gray-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white border border-gray-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

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
                className="appearance-none block w-full px-4 py-3 bg-white border border-gray-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                className="appearance-none block w-full px-4 py-3 bg-white border border-gray-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !!successMsg}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#1a1a4a] hover:bg-[#252566] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors uppercase tracking-widest shadow-lg border-t border-white/10 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? 'Creating Identity...' : 'Create Account'}
            </button>
          </form>
        </motion.div>

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-orange-600/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-red-600/10 blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default RegisterPage;
