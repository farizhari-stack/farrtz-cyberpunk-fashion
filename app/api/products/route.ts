import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: products, error } = await supabase.from('products').select('*');
        if (error) throw error;

        // Map snake_case from DB to camelCase for frontend
        const formattedProducts = products.map(p => ({
            ...p,
            originalPrice: p.original_price,
            discountPercentage: p.discount_percentage,
            discountEndTime: p.discount_end_time,
            imageUrl: p.image_url,
            isNew: p.is_new,
            isSale: p.is_sale
        }));

        return NextResponse.json(formattedProducts);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        // Convert camelCase to snake_case for DB
        const dbData = {
            title: json.title,
            price: json.price,
            original_price: json.originalPrice,
            discount_percentage: json.discountPercentage,
            discount_end_time: json.discountEndTime,
            image_url: json.imageUrl,
            category: json.category,
            description: json.description,
            is_new: json.isNew,
            is_sale: json.isSale
        };

        const { data, error } = await supabase.from('products').insert(dbData).select().single();
        if (error) throw error;

        return NextResponse.json({
            ...data,
            originalPrice: data.original_price,
            discountPercentage: data.discount_percentage,
            discountEndTime: data.discount_end_time,
            imageUrl: data.image_url,
            isNew: data.is_new,
            isSale: data.is_sale
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
    }
}
