import { supabase } from '../src/lib/supabase'
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

    // Check if any admins exist in the system
    async checkAdminExists(): Promise<boolean> {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('isAdmin', true)
            .limit(1)

        if (error) {
            console.error('Error checking admin existence:', error)
            return false
        }

        return data && data.length > 0
    },

    // Admin Registration - for multiple admins
    // If no admin exists, uses SETUP code (first time setup)
    // If admin exists, uses ADMIN code (for adding more admins)
    async adminRegister(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        adminCode: string;
    }) {
        // Check if any admin already exists
        const adminExists = await this.checkAdminExists()

        // Setup code for FIRST admin (when no admin exists)
        const FIRST_ADMIN_SETUP_CODE = import.meta.env.VITE_SETUP_CODE || 'FARRTZ_SETUP_2024'

        // Admin code for additional admins (when admin already exists)
        const ADMIN_REGISTRATION_CODE = import.meta.env.VITE_ADMIN_CODE || 'FARRTZ_ADMIN_2024'

        // Determine which code to validate
        const requiredCode = adminExists ? ADMIN_REGISTRATION_CODE : FIRST_ADMIN_SETUP_CODE
        const codeType = adminExists ? 'admin registration' : 'initial setup'

        if (userData.adminCode !== requiredCode) {
            throw new Error(`Invalid ${codeType} code`)
        }

        // Create auth user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                // Auto-confirm for easier setup (can be disabled in production)
                emailRedirectTo: `${window.location.origin}/farrtz-cyberpunk-fashion/admin`
            }
        })

        if (authError) throw new Error(authError.message)

        // Create admin user in users table
        const { data: user, error: dbError } = await supabase
            .from('users')
            .insert([{
                id: authData.user?.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                avatar: `https://cdn-icons-png.flaticon.com/512/2942/2942813.png`,
                isAdmin: true
            }])
            .select()
            .single()

        if (dbError) {
            // If user record creation fails, we should clean up the auth user
            console.error('Failed to create user record:', dbError)
            // Try to delete the auth user (best effort)
            await supabase.auth.signOut()
            throw new Error('Failed to create admin profile. Please try again.')
        }

        // If this is the first admin (setup mode), try to auto-login
        if (!adminExists && authData.session) {
            console.log('✅ First admin created and auto-logged in!')
            return {
                success: true,
                user,
                autoLogin: true,
                message: 'First admin created successfully! You are now logged in.'
            }
        }

        return {
            success: true,
            user,
            autoLogin: false,
            message: adminExists
                ? 'Admin account created! Please verify your email to login.'
                : 'First admin created! Check your email to verify, then login.'
        }
    },

    // Admin Forgot Password - send reset email
    async adminForgotPassword(email: string) {
        // First verify the email belongs to an admin
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email, isAdmin')
            .eq('email', email)
            .single()

        if (userError || !userData) {
            throw new Error('Email not found')
        }

        if (!userData.isAdmin) {
            throw new Error('This email is not registered as admin')
        }

        // Send password reset email via Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/farrtz-cyberpunk-fashion/admin/reset-password`
        })

        if (error) throw new Error(error.message)

        return {
            success: true,
            message: 'Password reset link sent to your email!'
        }
    },

    // Admin Update Password (after receiving reset link)
    async adminUpdatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) throw new Error(error.message)

        return {
            success: true,
            message: 'Password updated successfully!'
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
