import React, { useState } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Send, AlertCircle, Upload, X, CheckCircle } from 'lucide-react';
import { Feedback, User } from '../types';

const motion = framerMotion as any;

interface FeedbackSectionProps {
    user: User;
    onSubmitFeedback: (feedback: Omit<Feedback, 'id' | 'date' | 'status'>) => void;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ user, onSubmitFeedback }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackType, setFeedbackType] = useState<'feedback' | 'complaint'>('feedback');
    const [message, setMessage] = useState('');
    const [photoFile, setPhotoFile] = useState<string>('');
    const [submitted, setSubmitted] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoFile(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0 || message.trim() === '') {
            alert('Please provide a rating and message');
            return;
        }

        // Use user from props directly - no localStorage needed!
        if (!user || !user.id) {
            alert('Please login to submit feedback');
            return;
        }

        try {
            const feedbackData: any = {
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`,
                userEmail: user.email,
                rating,
                message: message.trim(),
                type: feedbackType,
            };

            // Add photo only for complaints
            if (feedbackType === 'complaint' && photoFile) {
                feedbackData.photoUrl = photoFile;
            }

            console.log('✅ Submitting feedback:', feedbackData); // Debug log

            onSubmitFeedback(feedbackData);

            // Show popup animation
            setShowPopup(true);

            // Reset form after short delay
            setTimeout(() => {
                setRating(0);
                setMessage('');
                setPhotoFile('');
                setFeedbackType('feedback');
                setSubmitted(true);
            }, 500);

            // Hide popup and success message
            setTimeout(() => {
                setShowPopup(false);
                setSubmitted(false);
            }, 4000);
        } catch (error) {
            console.error('❌ Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        }
    };

    return (
        <section className="relative bg-gradient-to-br from-[#1a0033] via-[#0f0c29] to-[#020024] py-16 overflow-hidden border-t border-purple-500/20">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-[100px] animate-pulse delay-1000"></div>
            </div>

            {/* Success Popup */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -50 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-br from-green-900/95 to-cyan-900/95 backdrop-blur-xl border-2 border-green-500 rounded-2xl p-8 shadow-2xl shadow-green-500/50"
                    >
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-20 h-20 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckCircle className="text-green-400" size={48} />
                            </motion.div>
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-black text-white mb-2 brand-font"
                            >
                                Successfully Sent!
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-300"
                            >
                                Thank you for your {feedbackType}!
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay for popup */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4">
                        <Star className="text-cyan-400" size={20} />
                        <span className="text-cyan-400 text-sm font-bold tech-font tracking-wider">YOUR FEEDBACK MATTERS</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-white brand-font mb-4">
                        Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Experience</span>
                    </h2>

                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Help us improve! Share your feedback, report issues, or let us know how we're doing.
                    </p>
                </motion.div>

                {/* Feedback Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-8">
                        {submitted && !showPopup ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-12"
                            >
                                <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-green-400" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                                <p className="text-gray-400">Your {feedbackType} has been submitted successfully.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Type Selection */}
                                <div>
                                    <label className="block text-white font-bold mb-3">Type</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFeedbackType('feedback');
                                                setPhotoFile(''); // Clear photo when switching to feedback
                                            }}
                                            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${feedbackType === 'feedback'
                                                    ? 'bg-cyan-500 text-black'
                                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                }`}
                                        >
                                            <MessageSquare className="inline mr-2" size={18} />
                                            Feedback
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFeedbackType('complaint')}
                                            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${feedbackType === 'complaint'
                                                    ? 'bg-orange-500 text-black'
                                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                }`}
                                        >
                                            <AlertCircle className="inline mr-2" size={18} />
                                            Complaint
                                        </button>
                                    </div>
                                </div>

                                {/* Star Rating */}
                                <div>
                                    <label className="block text-white font-bold mb-3">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    size={40}
                                                    className={`transition-all ${star <= (hoverRating || rating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-600'
                                                        }`}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                    {rating > 0 && (
                                        <p className="text-sm text-gray-400 mt-2">
                                            {rating === 1 && "We're sorry to hear that. How can we improve?"}
                                            {rating === 2 && "We appreciate your feedback. What went wrong?"}
                                            {rating === 3 && "Thank you! How can we do better?"}
                                            {rating === 4 && "Great! What did you like?"}
                                            {rating === 5 && "Excellent! We're glad you're happy!"}
                                        </p>
                                    )}
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-white font-bold mb-3">Your Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={5}
                                        placeholder="Tell us about your experience, suggestions, or any issues you've encountered..."
                                        className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                    />
                                </div>

                                {/* Photo Upload for Complaints */}
                                {feedbackType === 'complaint' && (
                                    <div>
                                        <label className="block text-white font-bold mb-3">Upload Photo (Optional)</label>
                                        <div className="border-2 border-dashed border-orange-500/30 rounded-lg p-6 text-center hover:border-orange-500/60 transition-colors">
                                            {photoFile ? (
                                                <div className="relative">
                                                    <img src={photoFile} alt="Complaint" className="max-h-64 mx-auto rounded-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setPhotoFile('')}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer">
                                                    <Upload className="mx-auto text-orange-400 mb-2" size={32} />
                                                    <p className="text-orange-400 font-bold mb-1">Upload Product Photo</p>
                                                    <p className="text-gray-500 text-sm">Click to upload image of defective product</p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-3 hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg shadow-purple-500/50"
                                >
                                    <Send size={20} />
                                    Submit {feedbackType === 'complaint' ? 'Complaint' : 'Feedback'}
                                </motion.button>
                            </form>
                        )}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-8 flex flex-wrap justify-center gap-6 text-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-sm">4.8 out of 5 based on 381,288 reviews</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FeedbackSection;
