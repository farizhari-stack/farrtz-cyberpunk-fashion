import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: conversations, error } = await supabase
            .from('chat_conversations')
            .select(`
                *,
                messages:chat_messages(*)
            `);

        if (error) throw error;

        // Formatted map for frontend
        const formatted = conversations.map(c => ({
            userId: c.user_id,
            userName: c.user_name,
            userEmail: c.user_email,
            lastMessageTime: c.last_message_time,
            unreadCount: c.unread_count,
            messages: c.messages.map((m: any) => ({
                id: m.id,
                conversationId: m.conversation_id,
                userId: m.user_id,
                userName: m.user_name,
                message: m.message,
                sender: m.sender,
                timestamp: m.timestamp,
                read: m.read
            }))
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();

        // 1. Check if conversation exists
        const { data: existingConv } = await supabase
            .from('chat_conversations')
            .select('*')
            .eq('user_id', json.userId)
            .single();

        let conversationId = json.userId;

        // 2. Create or Update Conversation
        if (!existingConv) {
            await supabase.from('chat_conversations').insert({
                user_id: json.userId,
                user_name: json.userName || 'User',
                user_email: '', // Optional or fetch from user table
                unread_count: json.sender === 'user' ? 1 : 0,
                last_message_time: new Date().toISOString()
            });
        } else {
            // Update unread count and time
            await supabase.from('chat_conversations')
                .update({
                    unread_count: json.sender === 'user' ? (existingConv.unread_count + 1) : 0,
                    last_message_time: new Date().toISOString()
                })
                .eq('user_id', json.userId);
        }

        // 3. Insert Message
        const { data: message, error } = await supabase
            .from('chat_messages')
            .insert({
                conversation_id: conversationId,
                user_id: json.userId,
                user_name: json.userName || existingConv?.user_name || 'User',
                message: json.message,
                sender: json.sender,
                read: json.sender === 'admin'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            ...message,
            userId: message.user_id,
            conversationId: message.conversation_id,
            userName: message.user_name
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error sending message' }, { status: 500 });
    }
}
