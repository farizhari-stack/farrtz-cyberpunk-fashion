import { supabase } from '../lib/supabase'
import type { User } from '../types'

// Auth Functions
export const authService = {
    // Admin Login using Supabase Auth
    async adminLogin(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw new Error('Invalid credentials')

        // Check if user is admin
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

        if (!userData?.isAdmin) {
            await supabase.auth.signOut()
            throw new Error('Not authorized as admin')
        }

        return {
            success: true,
            token: data.session?.access_token,
            user: userData
        }
    },

    // User Login
    async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw new Error('Invalid credentials')

        // Get user details from users table
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

        return {
            success: true,
            token: data.session?.access_token,
            user: userData
        }
    },

    // Register new user
    async register(userData: { email: string; password: string; firstName: string; lastName: string }) {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password
        })

        if (authError) throw new Error(authError.message)

        // Create user in users table
        const { data: user, error: dbError } = await supabase
            .from('users')
            .insert([{
                id: authData.user?.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.firstName}`,
                isAdmin: false
            }])
            .select()
            .single()

        if (dbError) throw new Error('Failed to create user profile')

        return {
            success: true,
            user
        }
    },

    // Logout
    async logout() {
        await supabase.auth.signOut()
    },

    // Get current user
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        return userData
    }
}

// Order Functions
export const ordersService = {
    async createOrder(orderData: any) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('orders')
            .insert([{ ...orderData, userId: user.id }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getOrdersByUser() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getAllOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('createdAt', { ascending: false })

        if (error) throw error
        return data || []
    },

    async updateOrderStatus(orderId: string, status: string) {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
