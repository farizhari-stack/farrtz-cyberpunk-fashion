import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: coupons, error } = await supabase.from('coupons').select('*');
        if (error) throw error;

        // Map snake_case to camelCase
        const formatted = coupons.map(c => ({
            ...c,
            discountPercent: c.discount_percent,
            createdDate: c.created_date,
            expiryDate: c.expiry_date,
            isActive: c.is_active,
            usageCount: c.usage_count,
            maxUsage: c.max_usage,
            createdBy: c.created_by,
            usedBy: c.used_by
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching coupons' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const dbCoupon = {
            code: json.code,
            discount_percent: json.discountPercent,
            created_date: new Date().toISOString(),
            expiry_date: json.expiryDate,
            is_active: json.isActive ?? true,
            max_usage: json.maxUsage,
            created_by: json.createdBy
        };

        const { data: coupon, error } = await supabase.from('coupons').insert(dbCoupon).select().single();
        if (error) throw error;

        return NextResponse.json({
            ...coupon,
            discountPercent: coupon.discount_percent,
            createdDate: coupon.created_date,
            expiryDate: coupon.expiry_date,
            isActive: coupon.is_active,
            usageCount: coupon.usage_count,
            maxUsage: coupon.max_usage,
            createdBy: coupon.created_by,
            usedBy: coupon.used_by
        });

    } catch (error) {
        return NextResponse.json({ error: 'Error creating coupon' }, { status: 500 });
    }
}
