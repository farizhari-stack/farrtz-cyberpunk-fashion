import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Query users table via Supabase Client
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return NextResponse.json({ success: false, message: 'User not found' });
        }

        // Simple password check (Note: In production use hashing!)
        if (user.password !== password) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' });
        }

        return NextResponse.json({
            success: true, user: {
                ...user,
                createdAt: user.created_at,
                firstName: user.first_name,
                lastName: user.last_name,
                isAdmin: user.is_admin
            }
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
