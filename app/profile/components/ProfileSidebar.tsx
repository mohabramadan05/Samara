'use client'
import React from 'react';
import styles from './ProfileSidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMapMarkerAlt, faShoppingBag, faWallet, faHeart } from '@fortawesome/free-solid-svg-icons';



interface ProfileSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, setActiveTab }) => {

    const menuItems = [
        {
            id: 'profile-info',
            label: 'Profile Info',
            icon: faUser
        },
        {
            id: 'my-address',
            label: 'My Address',
            icon: faMapMarkerAlt
        },
        {
            id: 'my-orders',
            label: 'My Orders',
            icon: faShoppingBag
        },
        {
            id: 'bonus-wallet',
            label: 'Bonus Wallet',
            icon: faWallet
        },
        {
            id: 'wishlist',
            label: 'Wishlist',
            icon: faHeart
        }
    ];

    return (
        <div className={styles.sidebar}>
            <ul className={styles.menu}>
                {menuItems.map((item) => (
                    <li
                        key={item.id}
                        className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <FontAwesomeIcon icon={item.icon} className={styles.menuIcon} />
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProfileSidebar; 