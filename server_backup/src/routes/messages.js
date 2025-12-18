const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ==================== GET MESSAGES ====================
// User: gets own conversation, Admin: gets all or specific user's
router.get('/', auth, async (req, res) => {
    try {
        const { userId } = req.query;

        let where = {};

        if (req.user.isAdmin) {
            // Admin can filter by userId or get all
            if (userId) {
                where.userId = userId;
            }
        } else {
            // Users can only see their own messages
            where.userId = req.user.id;
        }

        const messages = await prisma.message.findMany({
            where,
            orderBy: { createdAt: 'asc' }
        });

        // Transform to match frontend format
        const transformedMessages = messages.map(msg => ({
            id: msg.id,
            userId: msg.userId,
            userName: msg.userName,
            message: msg.message,
            sender: msg.sender.toLowerCase(),
            timestamp: msg.createdAt.toISOString(),
            read: msg.read
        }));

        res.json({
            success: true,
            messages: transformedMessages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Failed to get messages' });
    }
});

// ==================== GET CONVERSATIONS (Admin) ====================
router.get('/conversations', auth, adminOnly, async (req, res) => {
    try {
        // Get all messages grouped by userId
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Group by userId
        const conversationsMap = new Map();

        for (const msg of messages) {
            if (!conversationsMap.has(msg.userId)) {
                const user = await prisma.user.findUnique({
                    where: { id: msg.userId },
                    select: { id: true, firstName: true, lastName: true, email: true }
                });

                const unreadCount = await prisma.message.count({
                    where: {
                        userId: msg.userId,
                        sender: 'USER',
                        read: false
                    }
                });

                conversationsMap.set(msg.userId, {
                    userId: msg.userId,
                    userName: user ? `${user.firstName} ${user.lastName}` : msg.userName,
                    userEmail: user?.email || '',
                    messages: [],
                    lastMessageTime: msg.createdAt.toISOString(),
                    unreadCount
                });
            }
        }

        // Get messages for each conversation
        for (const [userId, conv] of conversationsMap) {
            const userMessages = messages
                .filter(m => m.userId === userId)
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                .map(m => ({
                    id: m.id,
                    userId: m.userId,
                    userName: m.userName,
                    message: m.message,
                    sender: m.sender.toLowerCase(),
                    timestamp: m.createdAt.toISOString(),
                    read: m.read
                }));
            conv.messages = userMessages;
        }

        res.json({
            success: true,
            conversations: Array.from(conversationsMap.values())
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ success: false, message: 'Failed to get conversations' });
    }
});

// ==================== SEND MESSAGE ====================
router.post('/', auth, async (req, res) => {
    try {
        const { message, targetUserId } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Determine sender type and userId
        const isAdmin = req.user.isAdmin;
        const userId = isAdmin ? targetUserId : req.user.id;
        const userName = `${req.user.firstName} ${req.user.lastName}`;

        if (isAdmin && !targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'Target user ID is required for admin messages'
            });
        }

        const newMessage = await prisma.message.create({
            data: {
                userId,
                userName,
                message: message.trim(),
                sender: isAdmin ? 'ADMIN' : 'USER',
                read: false
            }
        });

        res.status(201).json({
            success: true,
            message: {
                id: newMessage.id,
                userId: newMessage.userId,
                userName: newMessage.userName,
                message: newMessage.message,
                sender: newMessage.sender.toLowerCase(),
                timestamp: newMessage.createdAt.toISOString(),
                read: newMessage.read
            }
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// ==================== MARK MESSAGES AS READ ====================
router.put('/read', auth, async (req, res) => {
    try {
        const { userId } = req.body;

        // Mark messages as read
        if (req.user.isAdmin) {
            // Admin marks user messages as read
            await prisma.message.updateMany({
                where: {
                    userId: userId,
                    sender: 'USER',
                    read: false
                },
                data: { read: true }
            });
        } else {
            // User marks admin messages as read
            await prisma.message.updateMany({
                where: {
                    userId: req.user.id,
                    sender: 'ADMIN',
                    read: false
                },
                data: { read: true }
            });
        }

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark messages as read' });
    }
});

module.exports = router;
