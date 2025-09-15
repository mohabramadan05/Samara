import { NextRequest, NextResponse } from 'next/server';

type SumUpCheckoutResponse = {
    id?: string;
    status?: string;
    [key: string]: unknown;
};

export async function POST(req: NextRequest) {
    try {
        const { amount, currency = 'EUR', description = 'Website Order', checkout_reference } = await req.json();

        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const accessToken = process.env.SUMUP_ACCESS_TOKEN;
        const merchantCode = process.env.SUMUP_MERCHANT_CODE;
        const returnUrl = process.env.SUMUP_RETURN_URL;

        if (!accessToken || !merchantCode || !returnUrl) {
            return NextResponse.json({ error: 'SumUp configuration missing on server' }, { status: 500 });
        }

        const reference = checkout_reference || `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const sumupResponse = await fetch('https://api.sumup.com/v0.1/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                checkout_reference: reference,
                amount,
                currency,
                merchant_code: merchantCode,
                description,
                return_url: returnUrl,
            }),
        });

        const text = await sumupResponse.text();
        let data: unknown;
        try {
            data = JSON.parse(text);
        } catch {
            return NextResponse.json({ error: 'Invalid response from SumUp', raw: text }, { status: 502 });
        }

        if (!sumupResponse.ok) {
            return NextResponse.json({ error: 'SumUp error', details: data }, { status: sumupResponse.status });
        }

        const payload = data as SumUpCheckoutResponse;
        const status = payload.status;
        const id = payload.id;

        return NextResponse.json({ id, status: status, data: payload }, { status: 200 });
    } catch (error) {
        console.error('Error creating SumUp checkout:', error);
        return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
    }
}


