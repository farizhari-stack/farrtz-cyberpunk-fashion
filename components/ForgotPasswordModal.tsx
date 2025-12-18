
import React, { useState, useEffect } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Check, Timer, RotateCcw } from 'lucide-react';
import { authService } from '../services/supabaseAuth';

const motion = framerMotion as any;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for logic
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60); // 60 seconds countdown for resend
  const [canResend, setCanResend] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Reset state when closing or finishing
  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp(['', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setTimer(60);
    onClose();
  };

  const handleBack = () => {
    setError('');
    if (step > 1 && step < 5) {
      setStep(step - 1);
    } else {
      handleClose();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error on type
    
    // Auto focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // --- ACTIONS ---

  const handleSendCode = async () => {
      if (!email) {
          setError('Please enter your email address');
          return;
      }
      setIsLoading(true);
      setError('');

      try {
          const result = await authService.initiatePasswordReset(email);
          if (result.success) {
              setStep(2);
              setTimer(60); // Start timer
              setCanResend(false);
          } else {
              setError(result.message || 'Failed to send code');
          }
      } catch (err) {
          setError('An error occurred. Please try again.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleVerifyCode = async () => {
      const code = otp.join('');
      if (code.length < 5) {
          setError('Please enter the full 5-digit code');
          return;
      }

      setIsLoading(true);
      setError('');

      try {
          const result = await authService.validateResetCode(email, code);
          if (result.success) {
              setStep(3);
          } else {
              setError(result.message || 'Invalid code');
          }
      } catch (err) {
          setError('Validation failed');
      } finally {
          setIsLoading(false);
      }
  };

  const handleResendCode = async () => {
      if (!canResend) return;
      setOtp(['', '', '', '', '']); // Clear input
      await handleSendCode(); // Re-trigger send logic (resets timer inside)
  };

  const handleUpdatePassword = async () => {
      if (newPassword.length < 6) {
          setError('Password must be at least 6 characters');
          return;
      }
      if (newPassword !== confirmPassword) {
          setError('Passwords do not match');
          return;
      }

      setIsLoading(true);
      setError('');

      try {
          const result = await authService.completePasswordReset(email, newPassword);
          if (result.success) {
              setStep(5);
          } else {
              setError(result.message || 'Update failed');
          }
      } catch (err) {
          setError('An error occurred');
      } finally {
          setIsLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden relative text-gray-800"
        >
          {/* Header Icons */}
          <div className="flex justify-between items-center p-6 pb-2">
            {step < 5 ? (
              <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            ) : (
              <div></div> 
            )}
            
            <div className="flex items-center gap-1">
               <span role="img" aria-label="fox" className="text-xl">🦊</span>
               <span className="text-sm font-bold tracking-widest text-cyan-600 italic font-[Orbitron]">FARRTZ</span>
            </div>
          </div>

          <div className="px-8 pb-8 pt-2">
            {/* Error Banner */}
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg border border-red-100"
                >
                    {error}
                </motion.div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2">Forgot My Password ?</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Enter your email address to receive a 5-digit verification code.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                  />
                </div>

                <button
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isLoading ? 'Sending...' : 'Send Code'}
                </button>
              </motion.div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2">Check your email</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    We sent a code to <span className="font-bold text-gray-700">{email}</span>.
                  </p>
                </div>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && idx > 0) {
                              document.getElementById(`otp-${idx - 1}`)?.focus();
                          }
                      }}
                      className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-gray-800 transition-all"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                        <Timer size={14} />
                        {timer > 0 ? (
                             <span>Resend in 00:{timer < 10 ? `0${timer}` : timer}</span>
                        ) : (
                             <span className="text-red-500">Code Expired?</span>
                        )}
                     </div>
                     
                     <button 
                        onClick={handleResendCode}
                        disabled={!canResend || isLoading}
                        className={`flex items-center gap-1 text-xs font-bold ${canResend ? 'text-blue-600 hover:underline cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                     >
                        <RotateCcw size={12} /> Resend Code
                     </button>
                </div>

                <button
                  onClick={handleVerifyCode}
                  disabled={isLoading}
                  className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </motion.div>
            )}

            {/* Step 3: Confirmation Intermediate */}
            {step === 3 && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6 pt-4 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Check size={32} className="text-green-600" />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">Code Verified</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    You can now reset your password safely.
                  </p>
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 mt-4"
                >
                  Set New Password
                </button>
              </motion.div>
            )}

            {/* Step 4: Set New Password */}
            {step === 4 && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-xl font-bold mb-1">Set a new password</h3>
                  <p className="text-xs text-gray-500">Create a secure password</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="•••••••••••••••••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="•••••••••••••••••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={isLoading}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </motion.div>
            )}

            {/* Step 5: Success Final */}
            {step === 5 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center space-y-6 pt-4"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Check size={40} strokeWidth={3} className="text-black" />
                   </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">Successful</h3>
                  <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                    Congrats! Your password has been changed successfully.
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Return to Login
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
