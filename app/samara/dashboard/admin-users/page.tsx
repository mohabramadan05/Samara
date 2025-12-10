'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
// Using app API routes for CRUD; no direct supabase calls here
import styles from './admin-users.module.css';

interface AdminUser {
    id: number;
    created_at: string;
    username: string;
    email: string;
    role: string;
    is_active: string; // 'Y' or 'N'
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
    });

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await fetch('/api/admin-users');
            if (!res.ok) throw new Error('failed');
            const data = await res.json();
            setUsers(data.users || []);
        } catch {
            setError('Failed to load admin users. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = () => {
        setShowAddForm(true);
        setAddError(null);
        setNewUser({ username: '', password: '' });
    };

    const handleAddUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);

        if (!newUser.username.trim()) {
            setAddError('Username is required.');
            setAddLoading(false);
            return;
        }
        if (!newUser.password.trim()) {
            setAddError('Password is required.');
            setAddLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/admin-users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUser.username.trim(), password: newUser.password.trim() }),
            });
            if (!res.ok) throw new Error('failed');
            setShowAddForm(false);
            fetchUsers();
        } catch {
            setAddError('Failed to add user. Please try again.');
        } finally {
            setAddLoading(false);
        }
    };



    return (
        <DashboardLayout
            title="Admin Users Management"
            actionButton={{ label: 'Add Admin User', onClick: handleAddUser }}
        >
            <div className={styles.content}>
                {showAddForm && (
                    <form className={styles.addForm} onSubmit={handleAddUserSubmit}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />
                        <input
                            type="text"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />


                        <button type="submit" className={styles.statusButton} disabled={addLoading}>
                            {addLoading ? 'Adding...' : 'Add User'}
                        </button>
                        <button
                            type="button"
                            className={styles.statusButton}
                            onClick={() => setShowAddForm(false)}
                            disabled={addLoading}
                        >
                            Cancel
                        </button>
                        {addError && <div className={styles.error}>{addError}</div>}
                    </form>
                )}

                <div className={styles.filters}>
                    <input type="text" placeholder="Search users..." className={styles.searchInput} />
                    <select className={styles.filterSelect}>
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Admins</h3>
                        <p>{users.length}</p>
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.usersList}>
                    {isLoading ? (
                        <div className={styles.loading}>Loading users...</div>
                    ) : users.length > 0 ? (
                        <table className={styles.usersTable}>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles.usernameCell}>
                                                {/* <span className={styles.userBadge}>{user.username.charAt(0).toUpperCase()}</span> */}
                                                <span>{user.username}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No admin users found</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}


