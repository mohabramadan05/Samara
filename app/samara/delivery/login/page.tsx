'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabase';
import styles from './LoginForm.module.css'; // reuse your existing CSS module

export default function DeliveryLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDeliveryLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('id, username, role')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (error) {
                throw error;
            }

            if (!data) {
                setError('Invalid username or password');
                setIsLoading(false);
                return;
            }

            if (data.role !== 'delivery') {
                setError('Unauthorized: not a delivery user');
                setIsLoading(false);
                return;
            }

            // Create session data (cookie)
            const sessionData = {
                id: data.id,
                username: data.username,
                role: data.role,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            };

            Cookies.set('deliverySession', JSON.stringify(sessionData), {
                expires: 1, // 1 day
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            // Redirect to update page
            router.push('/samara/delivery/update');
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleDeliveryLogin} className={styles.loginForm} noValidate>
                <h1>Delivery Login</h1>

                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                        autoComplete="username"
                        disabled={isLoading}
                        aria-label="Username"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        disabled={isLoading}
                        aria-label="Password"
                    />
                </div>

                <button
                    type="submit"
                    className={styles.loginButton}
                    disabled={isLoading}
                    aria-label={isLoading ? 'Logging in...' : 'Login'}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
