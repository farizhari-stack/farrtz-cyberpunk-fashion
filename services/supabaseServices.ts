import { supabase } from '../src/lib/supabase'

export const productsService = {
    async getAllProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('createdAt', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getProductById(id: number) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async createProduct(product: any) {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateProduct(id: number, product: any) {
        const { data, error } = await supabase
            .from('products')
            .update(product)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteProduct(id: number) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

export const couponsService = {
    async getAllCoupons() {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('createdAt', { ascending: false })

        if (error) throw error
        return data || []
    },

    async createCoupon(coupon: any) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('coupons')
            .insert([{ ...coupon, createdById: user.id }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async toggleCouponStatus(id: string) {
        const { data: coupon } = await supabase
            .from('coupons')
            .select('isActive')
            .eq('id', id)
            .single()

        const { data, error } = await supabase
            .from('coupons')
            .update({ isActive: !coupon?.isActive })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteCoupon(id: string) {
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async useCoupon(code: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .eq('isActive', true)
            .single()

        if (couponError || !coupon) throw new Error('Invalid coupon')

        // Check if already used
        const { data: usage } = await supabase
            .from('coupon_usages')
            .select('*')
            .eq('couponId', coupon.id)
            .eq('userId', user.id)
            .single()

        if (usage) throw new Error('Coupon already used')

        // Create usage record
        await supabase
            .from('coupon_usages')
            .insert([{ couponId: coupon.id, userId: user.id }])

        // Update usage count
        await supabase
            .from('coupons')
            .update({ usageCount: (coupon.usageCount || 0) + 1 })
            .eq('id', coupon.id)

        return coupon
    }
}

export const messagesService = {
    async getAllMessages() {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('createdAt', { ascending: true })

        if (error) throw error
        return data || []
    },

    async sendMessage(message: any) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('messages')
            .insert([{ ...message, userId: user.id }])
            .select()
            .single()

        if (error) throw error
        return data
    }
}

export const feedbackService = {
    async getAllFeedback() {
        const { data, error } = await supabase
            .from('feedbacks')
            .select('*')
            .order('createdAt', { ascending: false })

        if (error) throw error
        return data || []
    },

    async createFeedback(feedback: any) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('feedbacks')
            .insert([{ ...feedback, userId: user.id }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateFeedbackStatus(id: string, status: string) {
        const { data, error } = await supabase
            .from('feedbacks')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
