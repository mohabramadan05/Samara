'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './categories.module.css';
import Image from 'next/image';

interface Category {
    id: number;
    name: string;
    desc: string;
    image: string;
    active: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [formData, setFormData] = useState({ id: 0, name: '', desc: '', image: '', active: 'Y' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            let query = supabase.from('categories').select('*');
            if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
            const { data, error } = await query;
            if (error) throw error;
            setCategories(data || []);
        } catch {
            setError('Failed to load categories. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = () => {
        setShowForm(true);
        setFormError(null);
        setFormData({ id: 0, name: '', desc: '', image: '', active: 'Y' });
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEditCategory = (category: Category) => {
        setShowForm(true);
        setFormError(null);
        setFormData({
            id: category.id,
            name: category.name,
            desc: category.desc,
            image: category.image,
            active: category.active
        });
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        if (!formData.name.trim()) {
            setFormError('Category name is required.');
            setFormLoading(false);
            return;
        }

        try {
            let imageUrl = formData.image;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const { error: uploadError } = await supabase
                    .storage
                    .from('samara.storage')
                    .upload(`categories/${fileName}`, imageFile);
                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase
                    .storage
                    .from('samara.storage')
                    .getPublicUrl(`categories/${fileName}`);
                imageUrl = publicUrlData?.publicUrl || '';
            }

            if (formData.id === 0) {
                // Add new category
                const { error: insertError } = await supabase
                    .from('categories')
                    .insert([{ name: formData.name.trim(), desc: formData.desc.trim(), image: imageUrl, active: formData.active }]);
                if (insertError) throw insertError;
            } else {
                // Update existing category
                const { error: updateError } = await supabase
                    .from('categories')
                    .update({ name: formData.name.trim(), desc: formData.desc.trim(), image: imageUrl, active: formData.active })
                    .eq('id', formData.id);
                if (updateError) throw updateError;
            }

            setShowForm(false);
            fetchCategories();
        } catch {
            setFormError('Failed to save category. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="Categories Management"
            actionButton={{ label: 'Add New Category', onClick: handleAddCategory }}
        >
            <div className={styles.content}>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All Categories</option>
                    </select>
                </div>

                {showForm && (
                    <form className={styles.addForm} onSubmit={handleFormSubmit}>
                        <input
                            type="text"
                            placeholder="Category name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className={styles.searchInput}
                            disabled={formLoading}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={formData.desc}
                            onChange={e => setFormData({ ...formData, desc: e.target.value })}
                            className={styles.searchInput}
                            disabled={formLoading}
                        />
                        <label className={styles.imageUploadLabel} htmlFor="category-image">
                            {imageFile ? 'Change Image' : 'Upload Image'}
                        </label>
                        <input
                            id="category-image"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                            className={styles.searchInput}
                            disabled={formLoading}
                        />
                        {imageFile && (
                            <span className={styles.imageFileName}>{imageFile.name}</span>
                        )}

                        {/* Active/Inactive select */}
                        <select
                            className={styles.filterSelect}
                            value={formData.active}
                            onChange={e => setFormData({ ...formData, active: e.target.value })}
                            disabled={formLoading}
                        >
                            <option value="Y">Active</option>
                            <option value="N">Inactive</option>
                        </select>

                        <button type="submit" className={styles.statusButton} disabled={formLoading}>
                            {formLoading ? (formData.id === 0 ? 'Adding...' : 'Saving...') : (formData.id === 0 ? 'Add Category' : 'Save Changes')}
                        </button>
                        <button type="button" className={styles.statusButton} onClick={() => setShowForm(false)} disabled={formLoading}>
                            Cancel
                        </button>
                        {formError && <div className={styles.error}>{formError}</div>}
                    </form>
                )}

                <div className={styles.categoriesList}>
                    {error && <div className={styles.error}>{error}</div>}
                    {isLoading ? (
                        <div className={styles.loading}>Loading categories...</div>
                    ) : categories.length > 0 ? (
                        <table className={styles.categoriesTable}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Image</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>{cat.id}</td>
                                        <td>{cat.name}</td>
                                        <td>{cat.desc}</td>
                                        <td>
                                            {cat.image ? (
                                                <Image src={cat.image} alt={cat.name} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                                            ) : 'No image'}
                                        </td>
                                        <td>{cat.active === "Y" ? "Active" : "Inactive"}</td>
                                        <td>
                                            <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => handleEditCategory(cat)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>




                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No categories found</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
