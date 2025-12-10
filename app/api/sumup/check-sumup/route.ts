// app/api/check-sumup/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { checkout_id } = await req.json();

    if (!checkout_id) {
      return NextResponse.json({ success: false, error: 'checkout_id is required' }, { status: 400 });
    }

    const accessToken = process.env.SUMUP_ACCESS_TOKEN;

    const res = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkout_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('SumUp API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
