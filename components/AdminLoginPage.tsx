
import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { User } from '../types';
import { authService } from '../services/auth';

const motion = framerMotion as any;

interface AdminLoginPageProps {
    onLoginSuccess: (user: User) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await authService.adminLogin(email, password);

            if (result.success && result.user) {
                onLoginSuccess(result.user);
            } else {
                setError(result.message || 'Admin login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-gradient-to-br from-red-950 via-purple-950 to-gray-900">
            {/* Left Side - Image */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden bg-black">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                    alt="Admin Dashboard"
                    className="object-cover w-full h-full opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-950"></div>
                <div className="absolute bottom-10 left-10 text-white z-10">
                    <div className="h-1 w-20 bg-red-500 mb-4"></div>
                    <h2 className="text-4xl font-bold brand-font mb-2">ADMIN ACCESS</h2>
                    <p className="tech-font text-gray-300">Management & Control Center</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 relative">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold">
                            <span role="img" aria-label="shield" className="text-sm">🛡️</span>
                        </div>
                        <span className="text-xl font-black brand-font text-white italic">FARRTZ ADMIN</span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-white brand-font tracking-wide">Admin Login</h2>
                        <p className="mt-2 text-sm text-gray-400 tech-font">Enter admin credentials to access dashboard.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm px-4 py-2 rounded">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="admin-email" className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                                    Admin Email *
                                </label>
                                <input
                                    id="admin-email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 bg-white border border-red-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="admin@farrtz.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="admin-password" className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                                    Admin Password *
                                </label>
                                <input
                                    id="admin-password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 bg-white border border-red-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-red-600 to-purple-700 hover:from-red-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.5)] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
                        </button>

                        <div className="text-center">
                            <p className="text-xs text-gray-500 tech-font">
                                🔒 Secure admin-only access
                            </p>
                        </div>
                    </form>
                </motion.div>

                {/* Background Gradients */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-red-600/20 blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
