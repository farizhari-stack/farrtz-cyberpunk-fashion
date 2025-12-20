import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const json = await request.json();

        // Update user in Supabase
        const { data, error } = await supabase
            .from('users')
            .update({
                first_name: json.firstName,
                last_name: json.lastName,
                address: json.address,
                email: json.email, // Email change requires more validation usually, but allowing for now
                avatar: json.avatar
            })
            .eq('id', json.id) // Ensure we pass ID
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            user: {
                ...data,
                firstName: data.first_name,
                lastName: data.last_name,
                isAdmin: data.is_admin
                // Map other snake_case fields back to camelCase as needed
            }
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
    }
}
