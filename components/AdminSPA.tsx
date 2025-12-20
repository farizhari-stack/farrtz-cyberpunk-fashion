"use client";
import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminLoginPage from './AdminLoginPage';
import { User, Feedback, ChatConversation, Coupon } from '../types';
import { authService } from '../services/auth';
import { feedbackService, messagesService, couponsService } from '../services/localServices';

export default function AdminSPA() {
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Admin Data
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    const loadData = async () => {
        const [fbRes, msgRes, cpnRes] = await Promise.all([
            feedbackService.getAllFeedback(),
            messagesService.getAllMessages(),
            couponsService.getAllCoupons()
        ]);
        setFeedbacks(fbRes || []);
        setConversations(msgRes || []);
        setCoupons(cpnRes || []);
    };

    useEffect(() => {
        const currentAdmin = authService.getCurrentUser();
        if (currentAdmin?.isAdmin) {
            setAdminUser(currentAdmin);
        }
        loadData();
        setIsLoading(false);
    }, []);

    const handleAdminLoginSuccess = (user: User) => {
        setAdminUser(user);
        loadData();
    };

    const handleAdminLogout = async () => {
        await authService.logout();
        setAdminUser(null);
    };

    const handleUpdateFeedbackStatus = async (feedbackId: string, status: Feedback['status']) => {
        try {
            const feedback = await feedbackService.updateFeedbackStatus(feedbackId, status);
            if (feedback) {
                setFeedbacks((prev) =>
                    prev.map((f) => (f.id === feedbackId ? { ...f, status } : f))
                );
            }
        } catch (e) { console.error(e); }
    };

    const handleAdminSendMessage = async (userId: string, message: string) => {
        const messageData = {
            userId,
            message,
            sender: 'admin' as const,
        };

        try {
            const result = await messagesService.sendMessage(messageData);
            if (result) {
                const messages = await messagesService.getAllMessages();
                if (messages) setConversations(messages);
            }
        } catch (e) { console.error(e); }
    };

    const handleCreateCoupon = async (newCoupon: Omit<Coupon, 'id' | 'createdDate' | 'usageCount' | 'usedBy'>) => {
        try {
            const coupon = await couponsService.createCoupon(newCoupon);
            if (coupon) {
                setCoupons((prev) => [coupon, ...prev]);
                console.log('✅ Coupon created via API:', coupon);
            }
        } catch (e) { console.error(e); }
    };

    const handleToggleCouponStatus = async (couponId: string) => {
        try {
            const coupon = await couponsService.toggleCouponStatus(couponId);
            if (coupon) {
                setCoupons((prev) =>
                    prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
                );
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteCoupon = async (couponId: string) => {
        try {
            if (confirm('Delete this coupon?')) {
                await couponsService.deleteCoupon(couponId);
                setCoupons((prev) => prev.filter((c) => c.id !== couponId));
            }
        } catch (e) { console.error(e); }
    };


    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-400 brand-font">LOADING ADMIN PANEL...</div>;

    return (
        <>
            {!adminUser ? (
                <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} />
            ) : (
                <AdminDashboard
                    user={adminUser}
                    onNavigate={() => { }}
                    onLogout={handleAdminLogout}
                    feedbacks={feedbacks}
                    conversations={conversations}
                    coupons={coupons}
                    onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                    onSendMessage={handleAdminSendMessage}
                    onCreateCoupon={handleCreateCoupon}
                    onToggleCouponStatus={handleToggleCouponStatus}
                    onDeleteCoupon={handleDeleteCoupon}
                />
            )}
        </>
    );
}
