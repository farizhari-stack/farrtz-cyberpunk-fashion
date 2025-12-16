const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Sample products data
const products = [
    // T-shirts
    { title: 'NEON ORB Surreal Eye Portrait T-Shirt', price: 250000, category: 'T-shirt', isNew: true },
    { title: 'Neon Flamingo Vaporwave Tropic T-Shirt', price: 250000, category: 'T-shirt', isNew: true },
    { title: 'Porcelain Memory — Vintage Doll Study T-Shirt', price: 250000, category: 'T-shirt' },
    { title: 'CHROME SERAPHIM — CHR-01: Halo Requiem T-Shirt', price: 250000, category: 'T-shirt' },
    { title: 'Tiger Storm Seal — Unit RAIJIN T-Shirt', price: 250000, category: 'T-shirt' },
    { title: 'Cyber Fox Emblem — Tactical Mode T-Shirt', price: 250000, category: 'T-shirt' },
    { title: 'Vortex Serpent — Spindel Core (VOID-01) T-Shirt', price: 250000, category: 'T-shirt' },
    { title: 'RAIJU KITSUNE — Plasma Eclipse Form T-Shirt', price: 250000, category: 'T-shirt' },

    // Hoodies
    { title: 'Tech-Fleece Oversized Hoodie', price: 350000, category: 'Hoodies', isNew: true },
    { title: 'Glitch Camo Zip-Up', price: 350000, category: 'Hoodies' },
    { title: 'Netrunner Graphic Pullover', price: 350000, category: 'Hoodies' },
    { title: 'Void Black Mantle', price: 350000, category: 'Hoodies' },
    { title: 'Cyber-Samurai Tech Hoodie', price: 350000, category: 'Hoodies' },
    { title: 'Neon Stitch Heavyweight Hoodie', price: 350000, category: 'Hoodies', isSale: true, originalPrice: 450000 },

    // Bags
    { title: 'NEON ORB Surreal Eye Portrait Bag', price: 100000, category: 'Bags' },
    { title: 'Holo-Sheen Crossbody Messenger', price: 100000, category: 'Bags' },
    { title: 'Urban Drifter Tech Tote', price: 100000, category: 'Bags', isSale: true, originalPrice: 150000 },
    { title: 'Quantum Duffel Bag - Series 7', price: 100000, category: 'Bags' },

    // Hats
    { title: 'NEON ORB Surreal Eye Portrait Hat', price: 65000, category: 'Hats' },
    { title: 'Neon Visor v2 - Cyan', price: 65000, category: 'Hats' },
    { title: 'Street Samurai Snapback', price: 65000, category: 'Hats', isNew: true },
    { title: 'Digital Camo Bucket Hat', price: 65000, category: 'Hats' },

    // Tank Tops
    { title: 'NEON ORB Surreal Eye Portrait Tank Top', price: 120000, category: 'Tank Tops' },
    { title: 'Mesh Grid Runner Vest', price: 120000, category: 'Tank Tops' },
    { title: 'Neon Trim Workout Tank', price: 120000, category: 'Tank Tops', isSale: true, originalPrice: 180000 },

    // Shorts
    { title: 'Neon Flamingo Vaporwave Tropic Shorts', price: 100000, category: 'Shorts' },
    { title: 'Urban Utility Bermudas', price: 100000, category: 'Shorts' },
    { title: 'Neon Runner Athletic Shorts', price: 100000, category: 'Shorts', isNew: true },

    // Kids
    { title: 'Vintage Doll Study Kids T-Shirt', price: 150000, category: 'Kids' },
    { title: 'Future Hero Onesie', price: 150000, category: 'Kids' },
    { title: 'Robo-Pup Graphic Tee', price: 150000, category: 'Kids', isNew: true },
];

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            email: 'admin@gmail.com',
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Admin',
            avatar: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
            isAdmin: true
        }
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // Create sample user
    const userPassword = await bcrypt.hash('user123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: userPassword,
            firstName: 'Test',
            lastName: 'User',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Test',
            isAdmin: false
        }
    });
    console.log(`✅ Test user created: ${user.email}`);

    // Create products
    console.log('📦 Creating products...');

    for (const product of products) {
        await prisma.product.create({
            data: {
                title: product.title,
                price: product.isSale && product.originalPrice
                    ? Math.round(product.originalPrice * 0.5)
                    : product.price,
                originalPrice: product.originalPrice || null,
                category: product.category,
                imageUrl: '',
                description: `Premium ${product.category} from FARRTZ Cyberpunk Collection`,
                isNew: product.isNew || false,
                isSale: product.isSale || false,
                stock: 100
            }
        });
    }
    console.log(`✅ Created ${products.length} products`);

    // Create sample coupon
    const coupon = await prisma.coupon.create({
        data: {
            code: 'CYBER20',
            discountPercent: 20,
            isActive: true,
            usageCount: 0,
            maxUsage: 100,
            createdById: admin.id
        }
    });
    console.log(`✅ Sample coupon created: ${coupon.code} (${coupon.discountPercent}% off)`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📋 Test Credentials:');
    console.log('   Admin: admin@gmail.com / admin');
    console.log('   User:  user@example.com / user123');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
