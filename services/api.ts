
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Token Management ---
export const setToken = (token: string) => {
    localStorage.setItem('farrtz_token', token);
};

export const getToken = (): string | null => {
    return localStorage.getItem('farrtz_token');
};

export const removeToken = () => {
    localStorage.removeItem('farrtz_token');
};

// --- HTTP Helpers ---
const headers = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const handleResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return { success: false, message: error };
        }
        return data;
    }
    return { success: response.ok };
};

// --- API Modules ---

export const authApi = {
    login: async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.success && data.token) {
                setToken(data.token);
            }
            return data;
        } catch (err) {
            return { success: false, message: err.message };
        }
    },
    adminLogin: async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.success && data.token) {
                setToken(data.token);
            }
            return data;
        } catch (err) {
            return { success: false, message: err.message };
        }
    },
    register: async (firstName, lastName, email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });
            const data = await res.json();
            if (data.success && data.token) {
                setToken(data.token);
            }
            return data;
        } catch (err) {
            return { success: false, message: err.message };
        }
    },
    getCurrentUser: async () => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: headers(),
            });
            return handleResponse(res);
        } catch (err) {
            return { success: false, message: err.message };
        }
    },
    forgotPassword: async (email) => {
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            return handleResponse(res);
        } catch (err) {
            return { success: false, message: err.message };
        }
    },
    validateResetCode: async (email, code) => {
        try {
            const res = await fetch(`${API_URL}/auth/validate-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            return handleResponse(res);
        } catch (err) {
            return { success: false, message: err.message };
        }
    },
    resetPassword: async (email, newPassword) => {
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword }),
            });
            return handleResponse(res);
        } catch (err) {
            return { success: false, message: err.message };
        }
    }
};

export const productsApi = {
    getAll: async () => {
        try { // products route is public usually, but let's see
            const res = await fetch(`${API_URL}/products`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    getById: async (id) => {
        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    create: async (product) => {
        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(product),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    update: async (id, product) => {
        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify(product),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    delete: async (id) => {
        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: headers(),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    }
};

export const couponsApi = {
    getAll: async () => {
        try {
            const res = await fetch(`${API_URL}/coupons`, {
                method: 'GET',
                headers: headers(),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    create: async (coupon) => {
        try {
            const res = await fetch(`${API_URL}/coupons`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(coupon),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    delete: async (id) => {
        try {
            const res = await fetch(`${API_URL}/coupons/${id}`, {
                method: 'DELETE',
                headers: headers(),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    toggleStatus: async (id) => {
        try {
            const res = await fetch(`${API_URL}/coupons/${id}/toggle`, {
                method: 'PATCH',
                headers: headers(),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    useCoupon: async (couponId) => {
        try {
            const res = await fetch(`${API_URL}/coupons/use`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({ couponId }),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    }
};

export const messagesApi = {
    getAll: async () => {
        try {
            const res = await fetch(`${API_URL}/messages`, {
                method: 'GET',
                headers: headers(),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    sendMessage: async (messageData) => {
        try {
            const res = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(messageData),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    markRead: async (userId) => {
        try {
            const res = await fetch(`${API_URL}/messages/read/${userId}`, {
                method: 'PATCH',
                headers: headers(),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    }
};

export const feedbackApi = {
    getAll: async () => {
        try {
            const res = await fetch(`${API_URL}/feedback`, {
                method: 'GET',
                headers: headers(),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    create: async (feedback) => {
        try {
            const res = await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(feedback),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    updateStatus: async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/feedback/${id}/status`, {
                method: 'PATCH',
                headers: headers(),
                body: JSON.stringify({ status }),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    }
};

export const ordersApi = {
    create: async (orderData) => {
        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(orderData),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    getAll: async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'GET',
                headers: headers(),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    },
    updateStatus: async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PATCH',
                headers: headers(),
                body: JSON.stringify({ status }),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    }
};

export const usersApi = {
    update: async (id, userData) => {
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify(userData),
            });
            return handleResponse(res);
        } catch (err) { return { success: false, message: err.message }; }
    }
};
