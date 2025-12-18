const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ==================== GET ALL PRODUCTS ====================
router.get('/', async (req, res) => {
    try {
        const { category, search, isNew, isSale } = req.query;

        const where = {};

        if (category) {
            where.category = category;
        }

        if (search) {
            where.title = {
                contains: search,
                mode: 'insensitive'
            };
        }

        if (isNew === 'true') {
            where.isNew = true;
        }

        if (isSale === 'true') {
            where.isSale = true;
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Failed to get products' });
    }
});

// ==================== GET PRODUCT BY ID ====================
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Failed to get product' });
    }
});

// ==================== CREATE PRODUCT (Admin) ====================
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const {
            title, price, originalPrice, discountPercentage,
            discountEndTime, imageUrl, category, description,
            isNew, isSale, stock
        } = req.body;

        if (!title || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, price, and category are required'
            });
        }

        const product = await prisma.product.create({
            data: {
                title,
                price: parseInt(price),
                originalPrice: originalPrice ? parseInt(originalPrice) : null,
                discountPercentage: discountPercentage ? parseInt(discountPercentage) : null,
                discountEndTime: discountEndTime ? new Date(discountEndTime) : null,
                imageUrl: imageUrl || '',
                category,
                description: description || '',
                isNew: Boolean(isNew),
                isSale: Boolean(isSale),
                stock: stock ? parseInt(stock) : 100
            }
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
});

// ==================== UPDATE PRODUCT (Admin) ====================
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const {
            title, price, originalPrice, discountPercentage,
            discountEndTime, imageUrl, category, description,
            isNew, isSale, stock
        } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                title,
                price: parseInt(price),
                originalPrice: originalPrice ? parseInt(originalPrice) : null,
                discountPercentage: discountPercentage ? parseInt(discountPercentage) : null,
                discountEndTime: discountEndTime ? new Date(discountEndTime) : null,
                imageUrl,
                category,
                description,
                isNew: Boolean(isNew),
                isSale: Boolean(isSale),
                stock: stock ? parseInt(stock) : 100
            }
        });

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
});

// ==================== DELETE PRODUCT (Admin) ====================
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.product.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});

module.exports = router;
