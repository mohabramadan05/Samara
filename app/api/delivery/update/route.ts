import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

type UpdateBody = {
    order_id: string;
    status: string;
    delivery_comment?: string | null;
    delivery_image?: string | null;
    delivery_user?: string | null;
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as UpdateBody;

        // ✅ Validate inputs
        if (!body?.order_id || !body?.status) {
            return NextResponse.json(
                { error: 'order_id and status are required' },
                { status: 400 }
            );
        }

        // ✅ Create server-side Supabase client
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // ✅ Build update payload
        const updatePayload = {
            status: body.status,
            delivery_comment: body.delivery_comment ?? null,
            delivery_image: body.delivery_image ?? null,
            delivery_user: body.delivery_user ?? null,
            delivery_date: new Date().toISOString(),
        };

        // ✅ Update the order in the DB
        const { data, error } = await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', body.order_id) // <-- assumes your primary key column is "id"
            .select()
            .single();

        if (error) {
            console.error('Error updating order:', error);
            return NextResponse.json(
                { error: 'Failed to update order', details: error.message },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Order not found or no changes applied' },
                { status: 404 }
            );
        }

        // ✅ Return success with updated data
        return NextResponse.json({ success: true, order: data });
    } catch (error: unknown) {
        console.error('Server error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Server error', details: message },
            { status: 500 }
        );
    }
}
