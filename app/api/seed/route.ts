import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateMixedProducts } from '@/utils/products';

// Default Admin Account
const DEFAULT_ADMIN = {
    email: 'admin@gmail.com',
    password: 'admin123',
    first_name: 'System',
    last_name: 'Admin',
    avatar: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
    is_admin: true
};

export async function GET() {
    try {
        // Check if products exist
        const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Check if admin exists
        const { data: adminExists } = await supabase
            .from('users')
            .select('id')
            .eq('email', DEFAULT_ADMIN.email)
            .single();

        if (count && count > 0 && adminExists) {
            return NextResponse.json({ message: 'Database already seeded' });
        }

        // Seed Admin User if not exists
        if (!adminExists) {
            const { error: adminError } = await supabase
                .from('users')
                .insert(DEFAULT_ADMIN);

            if (adminError && adminError.code !== '23505') { // Ignore unique constraint violation
                console.error('Error creating admin:', adminError);
            } else {
                console.log('✅ Admin user created: admin@gmail.com / admin123');
            }
        }

        // Seed Products if none exist
        if (!count || count === 0) {
            const products = generateMixedProducts(50, 100);

            // Transform to snake_case for DB
            const dbProducts = products.map(p => ({
                title: p.title,
                price: p.price,
                original_price: p.originalPrice,
                discount_percentage: 0, // Default
                image_url: p.imageUrl || "",
                category: p.category,
                is_sale: p.isSale || false,
                is_new: p.isNew || false,
                description: `High-quality ${p.category} designed for the cyberpunk aesthetic.`
            }));

            // Insert in chunks to avoid payload limits
            const { error: productsError } = await supabase
                .from('products')
                .insert(dbProducts);

            if (productsError) {
                throw productsError;
            }
            console.log(`✅ ${products.length} products seeded`);
        }

        return NextResponse.json({
            message: 'Seeded successfully',
            admin: { email: DEFAULT_ADMIN.email, password: DEFAULT_ADMIN.password }
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Seeding failed', details: String(e) }, { status: 500 });
    }
}
