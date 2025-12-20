import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: feedbacks, error } = await supabase
            .from('feedbacks')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase
        const formattedFeedbacks = feedbacks.map(f => ({
            ...f,
            userId: f.user_id,
            userName: f.user_name,
            userEmail: f.user_email,
            photoUrl: f.photo_url,
            orderId: f.order_id,
        }));

        return NextResponse.json(formattedFeedbacks);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching feedbacks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();

        const dbFeedback = {
            user_id: json.userId,
            user_name: json.userName,
            user_email: json.userEmail,
            rating: json.rating,
            message: json.message,
            type: json.type,
            photo_url: json.photoUrl,
            order_id: json.orderId,
            status: json.status || 'pending',
            date: new Date().toISOString()
        };

        const { data: feedback, error } = await supabase.from('feedbacks').insert(dbFeedback).select().single();
        if (error) throw error;

        return NextResponse.json({
            ...feedback,
            userId: feedback.user_id,
            userName: feedback.user_name,
            userEmail: feedback.user_email,
            photoUrl: feedback.photo_url,
            orderId: feedback.order_id,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating feedback' }, { status: 500 });
    }
}
