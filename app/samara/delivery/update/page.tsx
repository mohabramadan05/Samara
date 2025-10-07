'use client';

import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './DeliveryUpdate.module.css'; // create this CSS or reuse styles
import Image from 'next/image';

interface DeliverySession {
    id: number;
    username: string;
    role: string;
    expiresAt: string;
}

export default function DeliveryUpdatePage() {
    const router = useRouter();
    const [session, setSession] = useState<DeliverySession | null>(null);
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState('picked_up');
    const [comment, setComment] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // Read cookie
        const raw = Cookies.get('deliverySession');
        if (!raw) {
            router.push('/samara/delivery/login');
            return;
        }
        try {
            const parsed: DeliverySession = JSON.parse(raw);
            if (!parsed || parsed.role !== 'delivery') {
                Cookies.remove('deliverySession');
                router.push('/samara/delivery/login');
                return;
            }
            setSession(parsed);
        } catch {
            Cookies.remove('deliverySession');
            router.push('/samara/delivery/login');
        }
    }, [router]);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handlePickFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
    };

    const handleLogout = () => {
        Cookies.remove('deliverySession');
        router.push('/samara/delivery/login');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!orderId.trim()) {
            setMessage('Order ID is required.');
            return;
        }

        setIsSubmitting(true);

        try {
            // If file present, upload to Supabase storage first (client-side upload)
            let imageUrl: string | null = null;
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `delivery/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('samara.storage')
                    .upload(fileName, file, { cacheControl: '3600', upsert: false });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('samara.storage')
                    .getPublicUrl(uploadData.path);

                imageUrl = publicUrlData.publicUrl;
            }

            // POST to server route to persist update
            const res = await fetch('/api/delivery/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({



                    order_id: orderId,
                    status: status,
                    delivery_comment: comment,
                    delivery_image: imageUrl,
                    delivery_user: session?.username,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error('Update error', data);
                setMessage(data?.error || 'Failed to save update.');
            } else {
                setMessage('Order update saved successfully.');
                // reset fields
                setOrderId('');
                setStatus('picked_up');
                setComment('');
                setFile(null);
            }
        } catch (err) {
            console.error(err);
            setMessage('An error occurred while saving update.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2>Delivery Update</h2>
                <div>
                    <span className={styles.who}>Signed in: {session?.username}</span>
                    <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <form className={styles.updateForm} onSubmit={handleSubmit}>
                <label>
                    Order ID
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Enter order id"
                        disabled={isSubmitting}
                    />
                </label>

                <label>
                    Status
                    <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={isSubmitting}>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </label>

                <label>
                    Comment (optional)
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a confirmation note or details"
                        rows={3}
                        disabled={isSubmitting}
                    />
                </label>

                <label>
                    Attach image (proof)
                    <div className={styles.fileRow}>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        <button type="button" onClick={handlePickFile} className={styles.pickBtn} disabled={isSubmitting}>
                            {file ? 'Change Image' : 'Choose Image'}
                        </button>

                        {previewUrl && (
                            <div className={styles.preview}>
                                <Image src={previewUrl} alt="preview" width={80} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                            </div>
                        )}
                    </div>
                </label>

                <div className={styles.actionsRow}>
                    <button type="submit" disabled={isSubmitting} className={styles.saveBtn}>
                        {isSubmitting ? 'Saving...' : 'Confirm Update'}
                    </button>
                </div>

                {message && <div className={styles.message}>{message}</div>}
            </form>
        </div>
    );
}
