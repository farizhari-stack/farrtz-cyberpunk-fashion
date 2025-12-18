
import React, { useState, useEffect } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { authService } from '../services/supabaseAuth';
import { supabase } from '../src/lib/supabase';

const motion = framerMotion as any;

interface AdminResetPasswordPageProps {
    onResetSuccess: () => void;
}

const AdminResetPasswordPage: React.FC<AdminResetPasswordPageProps> = ({ onResetSuccess }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        // Check if user came from a valid reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsValidSession(true);
            }
            setCheckingSession(false);
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validate passwords
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            const result = await authService.adminUpdatePassword(newPassword);

            if (result.success) {
                setSuccessMessage(result.message || 'Password updated successfully!');
                setTimeout(() => {
                    onResetSuccess();
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-950 via-purple-950 to-gray-900 flex items-center justify-center">
                <div className="text-white tech-font">Verifying reset link...</div>
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-950 via-purple-950 to-gray-900 flex items-center justify-center p-8">
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-8 py-6 rounded-lg text-center max-w-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">Invalid Reset Link</h2>
                    <p className="text-sm mb-4">This password reset link is invalid or has expired.</p>
                    <button
                        onClick={onResetSuccess}
                        className="text-red-400 hover:text-red-300 tech-font text-sm"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        );
    }

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
                    <div className="h-1 w-20 bg-orange-500 mb-4"></div>
                    <h2 className="text-4xl font-bold brand-font mb-2">RESET PASSWORD</h2>
                    <p className="tech-font text-gray-300">Create your new password</p>
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
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-700 rounded-lg flex items-center justify-center text-white font-bold">
                            <span role="img" aria-label="key" className="text-sm">🔑</span>
                        </div>
                        <span className="text-xl font-black brand-font text-white italic">FARRTZ ADMIN</span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-white brand-font tracking-wide">New Password</h2>
                        <p className="mt-2 text-sm text-gray-400 tech-font">Enter your new password below.</p>
                    </div>

                    {successMessage ? (
                        <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-4 rounded-lg text-center">
                            <div className="text-4xl mb-3">✅</div>
                            <p className="font-bold">{successMessage}</p>
                            <p className="text-sm mt-2">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm px-4 py-2 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                                        New Password *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 bg-white border border-orange-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                                        Confirm New Password *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 bg-white border border-orange-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        placeholder="Repeat password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(234,88,12,0.5)] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </motion.div>

                {/* Background Gradients */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-orange-600/20 blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-red-600/10 blur-[100px] pointer-events-none"></div>
            </div>
        </div>
    );
};

export default AdminResetPasswordPage;
