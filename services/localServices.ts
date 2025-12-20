import { Feedback, ChatConversation, ChatMessage, Coupon, Product } from '../types';

export const feedbackService = {
    getAllFeedback: async (): Promise<Feedback[]> => {
        try {
            const res = await fetch('/api/feedbacks');
            return res.ok ? res.json() : [];
        } catch { return []; }
    },

    createFeedback: async (feedback: Omit<Feedback, 'id'>): Promise<Feedback | null> => {
        try {
            const res = await fetch('/api/feedbacks', {
                method: 'POST',
                body: JSON.stringify(feedback)
            });
            return res.json();
        } catch { return null; }
    },

    updateFeedbackStatus: async (id: string, status: Feedback['status']): Promise<Feedback | null> => {
        return null;
    }
};

export const messagesService = {
    getAllMessages: async (): Promise<ChatConversation[]> => {
        try {
            const res = await fetch('/api/messages');
            return res.ok ? res.json() : [];
        } catch { return []; }
    },

    sendMessage: async (messageData: {
        userId: string;
        userName?: string;
        message: string;
        sender: 'user' | 'admin';
    }): Promise<boolean> => {
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify(messageData)
            });
            return res.ok;
        } catch { return false; }
    },

    markAsRead: async (userId: string): Promise<boolean> => {
        return true;
    }
};

export const couponsService = {
    getAllCoupons: async (): Promise<Coupon[]> => {
        try {
            const res = await fetch('/api/coupons');
            return res.ok ? res.json() : [];
        } catch { return []; }
    },

    createCoupon: async (coupon: Omit<Coupon, 'id' | 'createdDate' | 'usageCount' | 'usedBy'>): Promise<Coupon | null> => {
        try {
            const res = await fetch('/api/coupons', {
                method: 'POST',
                body: JSON.stringify(coupon)
            });
            return res.json();
        } catch { return null; }
    },

    toggleCouponStatus: async (id: string): Promise<Coupon | null> => {
        return null;
    },

    deleteCoupon: async (id: string): Promise<boolean> => {
        return true;
    },

    useCoupon: async (couponId: string): Promise<boolean> => {
        return true;
    }
};

export const productsApiService = {
    getAll: async (): Promise<{ success: boolean; products?: Product[] }> => {
        return { success: true, products: [] };
    },
    create: async (product: Omit<Product, 'id'>): Promise<{ success: boolean; product?: Product }> => {
        // Could redirect to productService
        return { success: false };
    },
    update: async (id: number, product: Partial<Product>): Promise<{ success: boolean; product?: Product }> => {
        return { success: false };
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
        return { success: false };
    }
};
