import { NextRequest, NextResponse } from 'next/server';

type SumUpUpdatePayload = {
    payment_type: 'card';
    card: {
        name: string;
        number: string;
        expiry_month: string;
        expiry_year: string;
        cvv: string;
    };
};

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const accessToken = process.env.SUMUP_ACCESS_TOKEN;
        if (!accessToken) {
            return NextResponse.json({ error: 'SumUp configuration missing on server' }, { status: 500 });
        }

        const { id } = context.params;
        if (!id) {
            return NextResponse.json({ error: 'Missing checkout id' }, { status: 400 });
        }

        const body = (await req.json()) as SumUpUpdatePayload;

        const sumupRes = await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const text = await sumupRes.text();
        let data: unknown;
        try {
            data = JSON.parse(text);
        } catch {
            return NextResponse.json({ error: 'Invalid response from SumUp', raw: text }, { status: 502 });
        }

        if (!sumupRes.ok) {
            return NextResponse.json({ error: 'SumUp error', details: data }, { status: sumupRes.status });
        }

        return NextResponse.json(data as object, { status: 200 });
    } catch (error) {
        console.error('Error updating SumUp checkout:', error);
        return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
    }
}


