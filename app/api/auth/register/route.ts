import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const json = await request.json();

        // Check for existing user via Supabase
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', json.email)
            .single();

        if (existing) {
            return NextResponse.json({ success: false, message: 'Email already registered' });
        }

        // Prepare user data
        const userData = {
            email: json.email,
            password: json.password,
            first_name: json.firstName,
            last_name: json.lastName,
            avatar: json.avatar,
            is_admin: json.isAdmin || false,
        };

        const { data: user, error } = await supabase
            .from('users')
            .insert(userData)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true, user: {
                ...user,
                firstName: user.first_name,
                lastName: user.last_name,
                isAdmin: user.is_admin
            }
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Register failed' }, { status: 500 });
    }
}
