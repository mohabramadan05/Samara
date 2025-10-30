import { NextRequest, NextResponse } from 'next/server';



export async function POST(req: NextRequest) {
    try {
        const { amount, currency = 'EUR', description = 'Website Order', checkout_reference } = await req.json();

        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const accessToken = process.env.SUMUP_ACCESS_TOKEN;
        const merchantCode = process.env.SUMUP_MERCHANT_CODE;
        const returnUrl = "https://samarashop.ie//payment-success";

        if (!accessToken || !merchantCode || !returnUrl) {
            return NextResponse.json({ error: 'SumUp configuration missing on server' }, { status: 500 });
        }

        const reference =
            checkout_reference ||
            `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

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
                redirect_url: returnUrl,
                hosted_checkout: { enabled: true },
            }),
        });

        const headers = Object.fromEntries(sumupResponse.headers.entries());
        const text = await sumupResponse.text();

        let data: unknown;
        try {
            data = JSON.parse(text);
        } catch {
            return NextResponse.json(
                { error: 'Invalid response from SumUp', raw: text },
                { status: 502 }
            );
        }

        return NextResponse.json(
            {
                message: 'SumUp API full response',
                status: sumupResponse.status,
                headers,
                raw: text,
                parsed: data,
            },
            { status: sumupResponse.status }
        );
    } catch (error) {
        console.error('Error creating SumUp checkout:', error);
        return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
    }
}
