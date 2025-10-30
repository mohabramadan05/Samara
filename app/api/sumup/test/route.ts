// app/api/test/route.ts
import { NextResponse } from 'next/server';

export function test() {
    const accessToken = process.env.SUMUP_ACCESS_TOKEN;
    return accessToken;
}

export async function GET() {
    const token = test();
    return NextResponse.json({ token });
}
