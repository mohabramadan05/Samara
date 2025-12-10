import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET request to fetch user wallet balance
export async function GET(request: Request) {
    try {
        // Get user ID from query parameters
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get wallet data from the database
        const { data, error } = await supabase
            .from('app_users')
            .select('bonus')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // User not found, return default value
                return NextResponse.json({ points: 0 });
            }

            return NextResponse.json({
                error: 'Failed to fetch wallet data',
                details: error.message
            }, { status: 500 });
        }

        // Return the points balance (or 0 if not set)
        return NextResponse.json({
            points: data?.bonus || 0
        });

    } catch (error: unknown) {
        console.error('Error in wallet API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
}

// PATCH request to deduct points from user wallet
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { userId, deduct } = body as { userId?: string; deduct?: number };

        if (!userId || typeof deduct !== 'number' || deduct <= 0) {
            return NextResponse.json({ error: 'userId and positive deduct amount are required' }, { status: 400 });
        }

        // Get current points
        const { data: current, error: fetchError } = await supabase
            .from('app_users')
            .select('bonus')
            .eq('id', userId)
            .single();

        if (fetchError) {
            return NextResponse.json({ error: 'Failed to fetch current points', details: fetchError.message }, { status: 500 });
        }

        const currentPoints = (current?.bonus as number | null) ?? 0;
        if (currentPoints < deduct) {
            return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
        }

        const newPoints = currentPoints - deduct;

        const { data: updated, error: updateError } = await supabase
            .from('app_users')
            .update({ bonus: newPoints })
            .eq('id', userId)
            .select('bonus')
            .single();

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update points', details: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ points: updated?.bonus ?? newPoints });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Server error', details: errorMessage }, { status: 500 });
    }
}