import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { data: orders } = await supabase.from('orders').select('*');

    // Map snake_case to camelCase
    const formattedOrders = orders?.map(o => ({
        ...o,
        userId: o.user_id,
        totalAmount: o.total_amount,
        paymentMethod: o.payment_method,
        paymentProofUrl: o.payment_proof_url,
    })) || [];

    return NextResponse.json(formattedOrders);
}

export async function POST(request: Request) {
    try {
        const json = await request.json();

        const dbOrder = {
            user_id: json.userId,
            total_amount: json.totalAmount,
            status: json.status,
            date: new Date().toISOString(), // Use ISO string for Supabase
            payment_method: json.paymentMethod,
            items: json.items
        };

        const { data: order, error } = await supabase.from('orders').insert(dbOrder).select().single();
        if (error) throw error;

        return NextResponse.json({
            success: true, order: {
                ...order,
                userId: order.user_id,
                totalAmount: order.total_amount,
                paymentMethod: order.payment_method,
            }
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Order failed' }, { status: 500 });
    }
}
