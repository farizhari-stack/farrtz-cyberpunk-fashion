import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { Star, MessageSquare, AlertCircle, Check, Eye, MessageCircle, Send, Image as ImageIcon } from 'lucide-react';
import { Feedback, ChatConversation, ChatMessage } from '../types';

const motion = framerMotion as any;

interface AdminFeedbackChatProps {
    feedbacks: Feedback[];
    conversations: ChatConversation[];
    onUpdateFeedbackStatus: (feedbackId: string, status: Feedback['status']) => void;
    onSendMessage: (userId: string, message: string) => void;
}

const AdminFeedbackChat: React.FC<AdminFeedbackChatProps> = ({
    feedbacks,
    conversations,
    onUpdateFeedbackStatus,
    onSendMessage,
}) => {
    const [activeTab, setActiveTab] = useState<'feedback' | 'complaint' | 'chat'>('feedback');
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [replyMessage, setReplyMessage] = useState('');

    // Separate feedbacks and complaints
    const feedbackList = feedbacks.filter(f => f.type === 'feedback');
    const complaintList = feedbacks.filter(f => f.type === 'complaint');

    const getAverageRating = (list: Feedback[]) => {
        if (list.length === 0) return 0;
        const sum = list.reduce((acc, f) => acc + f.rating, 0);
        return (sum / list.length).toFixed(1);
    };

    const getRatingCounts = (list: Feedback[]) => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        list.forEach((f) => {
            counts[f.rating as keyof typeof counts]++;
        });
        return counts;
    };

    const handleSendReply = (userId: string) => {
        if (replyMessage.trim()) {
            onSendMessage(userId, replyMessage.trim());
            setReplyMessage('');
        }
    };

    const handleChatFromComplaint = (complaint: Feedback) => {
        setActiveTab('chat');
        setSelectedConversation(complaint.userId);
    };

    const selectedConv = conversations.find((c) => c.userId === selectedConversation);

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br  from-cyan-900/40 to-cyan-800/40 border border-cyan-500/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <MessageSquare className="text-cyan-400" size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{feedbackList.length}</h3>
                    <p className="text-sm text-gray-400">Total Feedbacks</p>
                </div>

                <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 border border-orange-500/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="text-orange-400" size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{complaintList.length}</h3>
                    <p className="text-sm text-gray-400">Total Complaints</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Star className="text-yellow-400" size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{getAverageRating(feedbacks)}</h3>
                    <p className="text-sm text-gray-400">Average Rating</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <MessageCircle className="text-green-400" size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{conversations.length}</h3>
                    <p className="text-sm text-gray-400">Active Chats</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-purple-500/30">
                <button
                    onClick={() => setActiveTab('feedback')}
                    className={`px-6 py-3 font-bold transition-all ${activeTab === 'feedback'
                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <MessageSquare className="inline mr-2" size={18} />
                    Feedbacks ({feedbackList.length})
                </button>
                <button
                    onClick={() => setActiveTab('complaint')}
                    className={`px-6 py-3 font-bold transition-all relative ${activeTab === 'complaint'
                            ? 'text-orange-400 border-b-2 border-orange-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <AlertCircle className="inline mr-2" size={18} />
                    Complaints ({complaintList.length})
                    {complaintList.filter(c => c.status === 'pending').length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                            {complaintList.filter(c => c.status === 'pending').length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-6 py-3 font-bold transition-all relative ${activeTab === 'chat'
                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <MessageCircle className="inline mr-2" size={18} />
                    User Chats
                    {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                            {conversations.filter((c) => c.unreadCount > 0).length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'feedback' && (
                <div className="space-y-4">
                    {/* Rating Distribution for Feedbacks */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Feedback Rating Distribution</h3>
                        {Object.entries(getRatingCounts(feedbackList))
                            .reverse()
                            .map(([rating, count]) => {
                                const percentage = feedbackList.length > 0 ? (count / feedbackList.length) * 100 : 0;
                                return (
                                    <div key={rating} className="flex items-center gap-4 mb-3">
                                        <div className="flex items-center gap-1 w-20">
                                            <span className="text-white font-bold">{rating}</span>
                                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-gray-400 w-16 text-right">{count}</span>
                                    </div>
                                );
                            })}
                    </div>

                    {/* Feedback List */}
                    <div className="space-y-4">
                        {feedbackList.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No feedbacks yet</p>
                            </div>
                        ) : (
                            feedbackList.map((feedback) => (
                                <FeedbackCard
                                    key={feedback.id}
                                    feedback={feedback}
                                    onUpdateStatus={onUpdateFeedbackStatus}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'complaint' && (
                <div className="space-y-4">
                    {/* Rating Distribution for Complaints */}
                    <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Complaint Rating Distribution</h3>
                        {Object.entries(getRatingCounts(complaintList))
                            .reverse()
                            .map(([rating, count]) => {
                                const percentage = complaintList.length > 0 ? (count / complaintList.length) * 100 : 0;
                                return (
                                    <div key={rating} className="flex items-center gap-4 mb-3">
                                        <div className="flex items-center gap-1 w-20">
                                            <span className="text-white font-bold">{rating}</span>
                                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-gray-400 w-16 text-right">{count}</span>
                                    </div>
                                );
                            })}
                    </div>

                    {/* Complaint List */}
                    <div className="space-y-4">
                        {complaintList.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No complaints yet</p>
                            </div>
                        ) : (
                            complaintList.map((complaint) => (
                                <ComplaintCard
                                    key={complaint.id}
                                    complaint={complaint}
                                    onUpdateStatus={onUpdateFeedbackStatus}
                                    onChatWithUser={() => handleChatFromComplaint(complaint)}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="grid grid-cols-3 gap-4 h-[600px]">
                    {/* Conversations List */}
                    <div className="col-span-1 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-purple-500/30">
                            <h3 className="text-white font-bold">Conversations</h3>
                        </div>
                        <div className="overflow-y-auto h-[calc(100%-60px)]">
                            {conversations.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-sm">No conversations yet</p>
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <button
                                        key={conv.userId}
                                        onClick={() => setSelectedConversation(conv.userId)}
                                        className={`w-full p-4 border-b border-purple-500/20 hover:bg-white/5 transition-colors text-left ${selectedConversation === conv.userId ? 'bg-white/10' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-white font-bold text-sm">{conv.userName}</h4>
                                            {conv.unreadCount > 0 && (
                                                <span className="w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">
                                            {conv.messages[conv.messages.length - 1]?.message || 'No messages'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(conv.lastMessageTime).toLocaleTimeString()}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="col-span-2 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-lg flex flex-col overflow-hidden">
                        {selectedConv ? (
                            <>
                                <div className="p-4 border-b border-purple-500/30">
                                    <h3 className="text-white font-bold">{selectedConv.userName}</h3>
                                    <p className="text-sm text-gray-400">{selectedConv.userEmail}</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {selectedConv.messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] rounded-lg p-3 ${msg.sender === 'admin'
                                                        ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white'
                                                        : 'bg-white/10 text-white border border-purple-500/30'
                                                    }`}
                                            >
                                                <p className="text-sm break-words">{msg.message}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-purple-500/30">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendReply(selectedConv.userId)}
                                            placeholder="Type a reply..."
                                            className="flex-1 bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                        />
                                        <button
                                            onClick={() => handleSendReply(selectedConv.userId)}
                                            disabled={!replyMessage.trim()}
                                            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                                    <p>Select a conversation to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Feedback Card Component
const FeedbackCard: React.FC<{ feedback: Feedback; onUpdateStatus: (id: string, status: Feedback['status']) => void }> = ({ feedback, onUpdateStatus }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-6"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-bold">{feedback.userName}</h4>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400">
                            Feedback
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">{feedback.userEmail}</p>
                    <div className="flex gap-1 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <select
                        value={feedback.status}
                        onChange={(e) => onUpdateStatus(feedback.id, e.target.value as Feedback['status'])}
                        className="bg-black/40 border border-purple-500/30 text-white rounded px-3 py-1 text-sm"
                    >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>
            <p className="text-white mb-3">{feedback.message}</p>
            <p className="text-xs text-gray-500">{new Date(feedback.date).toLocaleString()}</p>
        </motion.div>
    );
};

// Complaint Card Component
const ComplaintCard: React.FC<{
    complaint: Feedback;
    onUpdateStatus: (id: string, status: Feedback['status']) => void;
    onChatWithUser: () => void;
}> = ({ complaint, onUpdateStatus, onChatWithUser }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-6"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-bold">{complaint.userName}</h4>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
                            Complaint
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">{complaint.userEmail}</p>
                    <div className="flex gap-1 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={i < complaint.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <select
                        value={complaint.status}
                        onChange={(e) => onUpdateStatus(complaint.id, e.target.value as Feedback['status'])}
                        className="bg-black/40 border border-orange-500/30 text-white rounded px-3 py-1 text-sm"
                    >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <button
                        onClick={onChatWithUser}
                        className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-1 rounded text-sm font-bold flex items-center gap-2 hover:from-purple-600 hover:to-cyan-600 transition-all"
                    >
                        <MessageCircle size={16} />
                        Chat
                    </button>
                </div>
            </div>
            <p className="text-white mb-3">{complaint.message}</p>
            {complaint.photoUrl && (
                <div className="mb-3">
                    <div className="flex items-center gap-2 text-orange-400 mb-2">
                        <ImageIcon size={16} />
                        <span className="text-sm font-bold">Attached Photo:</span>
                    </div>
                    <img
                        src={complaint.photoUrl}
                        alt="Complaint photo"
                        className="max-w-md max-h-64 rounded-lg border-2 border-orange-500/30 cursor-pointer hover:border-orange-500/60 transition-colors"
                        onClick={() => window.open(complaint.photoUrl, '_blank')}
                    />
                </div>
            )}
            <p className="text-xs text-gray-500">{new Date(complaint.date).toLocaleString()}</p>
        </motion.div>
    );
};

export default AdminFeedbackChat;
