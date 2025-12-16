const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ==================== GET ALL FEEDBACK (Admin) ====================
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const { status, type } = req.query;

        const where = {};
        if (status) where.status = status.toUpperCase();
        if (type) where.type = type.toUpperCase();

        const feedbacks = await prisma.feedback.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        // Transform to match frontend format
        const transformedFeedbacks = feedbacks.map(fb => ({
            id: fb.id,
            userId: fb.userId,
            userName: fb.userName,
            userEmail: fb.userEmail,
            rating: fb.rating,
            message: fb.message,
            type: fb.type.toLowerCase(),
            photoUrl: fb.photoUrl,
            orderId: fb.orderId,
            date: fb.createdAt.toISOString(),
            status: fb.status.toLowerCase()
        }));

        res.json({
            success: true,
            feedbacks: transformedFeedbacks
        });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to get feedback' });
    }
});

// ==================== GET USER'S FEEDBACK ====================
router.get('/my', auth, async (req, res) => {
    try {
        const feedbacks = await prisma.feedback.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        const transformedFeedbacks = feedbacks.map(fb => ({
            id: fb.id,
            userId: fb.userId,
            userName: fb.userName,
            userEmail: fb.userEmail,
            rating: fb.rating,
            message: fb.message,
            type: fb.type.toLowerCase(),
            photoUrl: fb.photoUrl,
            orderId: fb.orderId,
            date: fb.createdAt.toISOString(),
            status: fb.status.toLowerCase()
        }));

        res.json({
            success: true,
            feedbacks: transformedFeedbacks
        });
    } catch (error) {
        console.error('Get user feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to get feedback' });
    }
});

// ==================== CREATE FEEDBACK ====================
router.post('/', auth, async (req, res) => {
    try {
        const { rating, message, type, photoUrl, orderId } = req.body;

        if (!message || !type) {
            return res.status(400).json({
                success: false,
                message: 'Message and type are required'
            });
        }

        if (type === 'feedback' && (!rating || rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating (1-5) is required for feedback'
            });
        }

        const feedback = await prisma.feedback.create({
            data: {
                userId: req.user.id,
                userName: `${req.user.firstName} ${req.user.lastName}`,
                userEmail: req.user.email,
                rating: rating || 0,
                message,
                type: type.toUpperCase(),
                photoUrl: photoUrl || null,
                orderId: orderId || null,
                status: 'PENDING'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            feedback: {
                id: feedback.id,
                userId: feedback.userId,
                userName: feedback.userName,
                userEmail: feedback.userEmail,
                rating: feedback.rating,
                message: feedback.message,
                type: feedback.type.toLowerCase(),
                photoUrl: feedback.photoUrl,
                orderId: feedback.orderId,
                date: feedback.createdAt.toISOString(),
                status: feedback.status.toLowerCase()
            }
        });
    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
});

// ==================== UPDATE FEEDBACK STATUS (Admin) ====================
router.put('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['PENDING', 'REVIEWED', 'RESOLVED'];
        const upperStatus = status.toUpperCase();

        if (!validStatuses.includes(upperStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const feedback = await prisma.feedback.update({
            where: { id: req.params.id },
            data: { status: upperStatus }
        });

        res.json({
            success: true,
            message: 'Feedback status updated',
            feedback: {
                ...feedback,
                type: feedback.type.toLowerCase(),
                date: feedback.createdAt.toISOString(),
                status: feedback.status.toLowerCase()
            }
        });
    } catch (error) {
        console.error('Update feedback status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

// ==================== DELETE FEEDBACK (Admin) ====================
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        await prisma.feedback.delete({
            where: { id: req.params.id }
        });

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete feedback' });
    }
});

module.exports = router;
