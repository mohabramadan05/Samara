'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './ChatFab.module.css';
import chatImg from '@/app/assets/about-model-image.png';

type ChatFabProps = {
    href?: string;
    ariaLabel?: string;
};

export default function ChatFab({ href = '/chat', ariaLabel = 'Open chat' }: ChatFabProps) {
    const [showMessage, setShowMessage] = useState(false);
    const pathname = usePathname();

    // ✅ Define main routes where the chat should appear (including all their subroutes)
    const allowedMainPaths = ['/samara', '/samara/admin', '/samara/dashboard', '/chat','/payment-success'];

    // ✅ Check if current path starts with any of the allowed main paths
    const isAllowed = allowedMainPaths.some(path =>
        path === '/' ? pathname === '/' : pathname.startsWith(path)
    );

    useEffect(() => {
        if (isAllowed) {
            const timer = setTimeout(() => {
                setShowMessage(true);
            }, 30000); // 2 minutes
            return () => clearTimeout(timer);
        }
    }, [isAllowed]);

    if (isAllowed) {
        return null; // don't render outside allowed routes
    }
    return (
        <div className={styles.wrapper}>
            {/* Only show message after delay */}
            {showMessage && (
                <div className={styles.message}>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setShowMessage(false)}
                        aria-label="Close message"

                    >
                        ×
                    </button>
                    <p className={styles.messageText}>
                        Hello, I&apos;m Samara 👋<br />How can I help you?
                    </p>
                </div>
            )}

            <Link href={href} className={styles.fab} aria-label={ariaLabel}>
                <Image src={chatImg} alt="" width={48} height={48} className={styles.image} />
            </Link>
        </div>
    );
}
