'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './ChatFab.module.css';
import chatImg from '@/app/assets/about-model-image.png';

type ChatFabProps = {
    href?: string;
    ariaLabel?: string;
};

export default function ChatFab({ href = '/chat', ariaLabel = 'Open chat' }: ChatFabProps) {
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        // Show message after 2 minutes (120000 ms)
        const timer = setTimeout(() => {
            setShowMessage(true);
        }, 30000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={styles.wrapper}>
            {/* Only show message after delay */}
            {showMessage && (
                <div className={styles.message}>
                    Hello, I&apos;m Samara 👋<br />How can I help you?
                </div>
            )}

            <Link href={href} className={styles.fab} aria-label={ariaLabel}>
                <Image src={chatImg} alt="" width={48} height={48} className={styles.image} />
            </Link>
        </div>
    );
}
