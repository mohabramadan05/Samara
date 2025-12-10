import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// import crypto from 'crypto';

// // Helper to hash passwords using SHA-256. This keeps the API dependency-free.
// function hashPassword(plain: string): string {
//     const hash = crypto.createHash('sha256');
//     hash.update(plain);
//     return hash.digest('hex');
// }

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('id, username')
            .order('id', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ users: data ?? [] });
    } catch {
        return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const username: string = (body?.username ?? '').trim();
        const password: string = (body?.password ?? '').toString();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'username and password are required' },
                { status: 400 }
            );
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: 'username must be at least 3 characters' },
                { status: 400 }
            );
        }

        // const passwordHash = hashPassword(password);

        const { data, error } = await supabase
            .from('admin_users')
            .insert([
                {
                    username,
                    // password: passwordHash,
                    password: password,
                },
            ])
            .select('id, username')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ user: data }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
    }
}


