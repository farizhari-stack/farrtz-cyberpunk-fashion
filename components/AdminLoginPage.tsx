
import React, { useState, useEffect } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { User } from '../types';
import { authService } from '../services/supabaseAuth';

const motion = framerMotion as any;

interface AdminLoginPageProps {
    onLoginSuccess: (user: User) => void;
}

type ViewMode = 'login' | 'register' | 'forgot-password' | 'reset-success';

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('login');
    const [isFirstSetup, setIsFirstSetup] = useState(false);
    const [checkingSetup, setCheckingSetup] = useState(true);

    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Register state
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [adminCode, setAdminCode] = useState('');

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState('');

    // Check if this is first-time setup (no admins exist)
    useEffect(() => {
        const checkSetup = async () => {
            try {
                const adminExists = await authService.checkAdminExists();
                setIsFirstSetup(!adminExists);
                // If no admin exists, show register form by default
                if (!adminExists) {
                    setViewMode('register');
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
            } finally {
                setCheckingSetup(false);
            }
        };
        checkSetup();
    }, []);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await authService.adminLogin(email, password);

            if (result.success && result.user) {
                onLoginSuccess(result.user);
            }
        } catch (err: any) {
            setError(err.message || 'Invalid credentials or unauthorized access');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        // Validate passwords match
        if (regPassword !== regConfirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        // Validate password strength
        if (regPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            const result = await authService.adminRegister({
                email: regEmail,
                password: regPassword,
                firstName: regFirstName,
                lastName: regLastName,
                adminCode: adminCode
            });

            if (result.success) {
                // If auto-login is enabled (first admin), log in immediately
                if (result.autoLogin && result.user) {
                    setSuccessMessage('First admin created! Logging you in...');
                    setTimeout(() => {
                        onLoginSuccess(result.user);
                    }, 1500);
                } else {
                    setSuccessMessage(result.message || 'Admin account created! Check your email to verify.');
                    // Clear form
                    setRegFirstName('');
                    setRegLastName('');
                    setRegEmail('');
                    setRegPassword('');
                    setRegConfirmPassword('');
                    setAdminCode('');
                    // Switch to login after 3 seconds
                    setTimeout(() => {
                        setViewMode('login');
                        setSuccessMessage('');
                    }, 3000);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create admin account');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await authService.adminForgotPassword(forgotEmail);

            if (result.success) {
                setSuccessMessage(result.message || 'Reset link sent to your email!');
                setViewMode('reset-success');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    const renderLoginForm = () => (
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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

            <div className="flex justify-between items-center text-sm">
                <button
                    type="button"
                    onClick={() => { setViewMode('forgot-password'); clearMessages(); }}
                    className="text-red-400 hover:text-red-300 transition-colors tech-font"
                >
                    Forgot Password?
                </button>
                <button
                    type="button"
                    onClick={() => { setViewMode('register'); clearMessages(); }}
                    className="text-purple-400 hover:text-purple-300 transition-colors tech-font"
                >
                    Register New Admin
                </button>
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-500 tech-font">
                    🔒 Secure admin-only access
                </p>
            </div>
        </form>
    );

    const renderRegisterForm = () => (
        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm px-4 py-2 rounded">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="bg-green-500/20 border border-green-500 text-green-200 text-sm px-4 py-2 rounded">
                    {successMessage}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                        First Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        className="appearance-none block w-full px-4 py-2.5 bg-white border border-red-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                        Last Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        className="appearance-none block w-full px-4 py-2.5 bg-white border border-red-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                    Email *
                </label>
                <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 bg-white border border-red-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="newadmin@farrtz.com"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                    Password *
                </label>
                <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 bg-white border border-red-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Min. 6 characters"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                    Confirm Password *
                </label>
                <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 bg-white border border-red-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Repeat password"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                    {isFirstSetup ? 'Initial Setup Code *' : 'Admin Registration Code *'}
                </label>
                <input
                    type="password"
                    required
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 bg-white border border-purple-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder={isFirstSetup ? 'FARRTZ_SETUP_2024' : 'Secret admin code'}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {isFirstSetup
                        ? 'Default setup code: FARRTZ_SETUP_2024'
                        : 'Contact existing admin for the code'}
                </p>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-red-700 hover:from-purple-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(147,51,234,0.5)] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
                {isLoading ? 'Creating Account...' : 'Register Admin'}
            </button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={() => { setViewMode('login'); clearMessages(); }}
                    className="text-gray-400 hover:text-white transition-colors tech-font text-sm"
                >
                    ← Back to Login
                </button>
            </div>
        </form>
    );

    const renderForgotPasswordForm = () => (
        <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm px-4 py-2 rounded">
                    {error}
                </div>
            )}

            <div className="text-sm text-gray-300 tech-font">
                Enter your admin email address. We'll send you a link to reset your password.
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider tech-font mb-1">
                    Admin Email *
                </label>
                <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 bg-white border border-red-700 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="admin@farrtz.com"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(234,88,12,0.5)] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={() => { setViewMode('login'); clearMessages(); }}
                    className="text-gray-400 hover:text-white transition-colors tech-font text-sm"
                >
                    ← Back to Login
                </button>
            </div>
        </form>
    );

    const renderResetSuccess = () => (
        <div className="mt-8 space-y-6 text-center">
            <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-4 rounded-lg">
                <div className="text-4xl mb-3">📧</div>
                <p className="font-bold mb-2">Check Your Email!</p>
                <p className="text-sm">{successMessage || 'Password reset link has been sent to your email address.'}</p>
            </div>

            <div className="text-sm text-gray-400 tech-font">
                <p>Click the link in the email to reset your password.</p>
                <p className="mt-2">Didn't receive email? Check spam folder.</p>
            </div>

            <button
                type="button"
                onClick={() => { setViewMode('login'); clearMessages(); setForgotEmail(''); }}
                className="text-red-400 hover:text-red-300 transition-colors tech-font text-sm"
            >
                ← Return to Login
            </button>
        </div>
    );

    const getTitle = () => {
        switch (viewMode) {
            case 'register': return isFirstSetup ? '🚀 First Time Setup' : 'Register Admin';
            case 'forgot-password': return 'Reset Password';
            case 'reset-success': return 'Email Sent';
            default: return 'Admin Login';
        }
    };

    const getSubtitle = () => {
        switch (viewMode) {
            case 'register': return isFirstSetup
                ? 'No admin found! Create your first admin account to get started.'
                : 'Create a new admin account with authorization code.';
            case 'forgot-password': return 'Recover your admin account access.';
            case 'reset-success': return 'Check your inbox for reset link.';
            default: return 'Enter admin credentials to access dashboard.';
        }
    };

    // Show loading while checking setup
    if (checkingSetup) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-950 via-purple-950 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-white tech-font">Checking system status...</p>
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
                    <div className="h-1 w-20 bg-red-500 mb-4"></div>
                    <h2 className="text-4xl font-bold brand-font mb-2">ADMIN ACCESS</h2>
                    <p className="tech-font text-gray-300">Management & Control Center</p>
                    {viewMode === 'register' && (
                        <p className="tech-font text-purple-400 mt-2 text-sm">Multi-Admin Support Enabled</p>
                    )}
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 relative overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-6"
                    key={viewMode}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold">
                            <span role="img" aria-label="shield" className="text-sm">🛡️</span>
                        </div>
                        <span className="text-xl font-black brand-font text-white italic">FARRTZ ADMIN</span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-white brand-font tracking-wide">{getTitle()}</h2>
                        <p className="mt-2 text-sm text-gray-400 tech-font">{getSubtitle()}</p>
                    </div>

                    {viewMode === 'login' && renderLoginForm()}
                    {viewMode === 'register' && renderRegisterForm()}
                    {viewMode === 'forgot-password' && renderForgotPasswordForm()}
                    {viewMode === 'reset-success' && renderResetSuccess()}
                </motion.div>

                {/* Background Gradients */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-red-600/20 blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
