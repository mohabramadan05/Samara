// /api/cities/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Fetch active cities from Supabase
        const { data: cities, error } = await supabase
            .from('cities')
            .select('id, name, is_active') // adjust fields according to your schema
            .eq('is_active', 'Y')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching cities:', error);
            return NextResponse.json(
                { error: 'Failed to fetch cities', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            cities: cities || [],
        });
    } catch (error: unknown) {
        console.error('Server error fetching cities:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Server error', details: errorMessage }, { status: 500 });
    }
}
