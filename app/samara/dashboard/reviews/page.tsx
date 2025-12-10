'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './messages.module.css';

interface Review {
    id: number;
    user: string;
    rating: number;
    commnet: string;
    createdAt: string;
    show: string;
}



export default function MessagesPage() {
    const [review, setReview] = useState<Review[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        show: 0,
        hide: 0
    });
    const fetchMessages = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('reviews')
                .select('*', { count: 'exact' });

            if (searchQuery) {
                query = query.ilike('subject', `%${searchQuery}%`);
            }
            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            const show = data?.filter((msg) => msg.show === 'Y').length || 0;
            const hide = data?.filter((msg) => msg.show === 'N').length || 0;

            setReview(data || []);
            setStats({
                total: count || 0,
                show,
                hide
            });
        } catch {
            setError('Failed to load messages. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, statusFilter]);

    const handleChangeStatus = async (id: number, show: 'Y' | 'N') => {
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ show })
                .eq('id', id);
            if (error) throw error;
            fetchMessages();
        } catch {
            setError('Failed to update message status. Please try again.');
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return (
        <DashboardLayout
            title="Reviews Management"
        >
            <div className={styles.content}>
                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search Review..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Messages</option>
                        <option value="show">show</option>
                        <option value="hide">hide</option>
                    </select>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Review</h3>
                        <p>{stats.total}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Show Messages</h3>
                        <p>{stats.show}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Hide Messages</h3>
                        <p>{stats.hide}</p>
                    </div>
                </div>

                <div className={styles.messagesList}>
                    {isLoading ? (
                        <div className={styles.loading}>Loading messages...</div>
                    ) : review.length > 0 ? (
                        <table className={styles.messagesTable}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>createdAt</th>
                                    <th>show</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {review.map((msg) => (
                                    <tr key={msg.id}>
                                        <td>{msg.user}</td>
                                        <td>{msg.rating}</td>
                                        <td>{msg.commnet}</td>
                                        <td>{new Date(msg.createdAt).toLocaleString()}</td>
                                        <td>{msg.show}</td>

                                        <td>
                                            {msg.show !== 'Y' && (
                                                <button
                                                    className={`${styles.statusButton} ${styles.markRead}`}
                                                    onClick={() => handleChangeStatus(msg.id, 'Y')}
                                                >
                                                    Show
                                                </button>
                                            )}
                                            {msg.show !== 'N' && (
                                                <button
                                                    className={`${styles.statusButton} ${styles.archive}`}
                                                    onClick={() => handleChangeStatus(msg.id, 'N')}
                                                >
                                                    Hide
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No messages found</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 