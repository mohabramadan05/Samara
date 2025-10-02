'use client'

import Link from 'next/link';
import Image from 'next/image';
import styles from './ChatFab.module.css';
import chatImg from '@/app/assets/about-model-image.png';

type ChatFabProps = {
    href?: string;
    ariaLabel?: string;
};

export default function ChatFab({ href = '/chat', ariaLabel = 'Open chat' }: ChatFabProps) {
    return (
        <Link href={href} className={styles.fab} aria-label={ariaLabel}>
            <Image src={chatImg} alt="" width={0} height={0} className={styles.image} />
        </Link>
    );
}


