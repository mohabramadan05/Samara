'use client'

import React, { useEffect, useMemo, useState } from 'react';
import styles from './NotificationStack.module.css';
import Image, { StaticImageData } from 'next/image';
import pointsImg from '@/app/assets/popups/box.png';
import deliveryImg from '@/app/assets/popups/del.png';
import donateImg from '@/app/assets/popups/don.png';
import discountImg from '@/app/assets/popups/50.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import chatImg from '@/app/assets/logo.png';

type Notice = {
    id: string;
    title: string;
    body: string;
    cta?: { label: string; href: string };
    image: StaticImageData;
};

const notices: Notice[] = [
    {
        id: 'points',
        title: 'Congratulations',
        body:
            'Swipe. Earn. Repeat. Your points = money in the shopping bank! Earn points on every product and turn them into instant discount!',
        cta: { label: 'Explore Products', href: '/category' },
        image: pointsImg,
    },
    {
        id: 'delivery',
        title: 'Delivery Deal',
        body: 'Enjoy FREE delivery on all orders over €50 - no hidden fees, just great deals',
        cta: { label: 'Explore Products', href: '/delivery-deal' },
        image: deliveryImg,
    },
    {
        id: 'gaza',
        title: 'Gaza donation',
        body: 'Even small coins can carry big compassion. Donate 50 cents for Gaza today.',
        cta: { label: 'Donate To Gaza', href: '/50-discount-deal' },
        image: donateImg,
    },
    {
        id: 'deal50',
        title: '50% discount deal',
        body: 'Helping hand, open heart - take 50% off, because no one should feel left behind.',
        cta: { label: 'Read More', href: '/50-discount-deal' },
        image: discountImg,
    },
];

export default function NotificationStack() {
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    const [completed, setCompleted] = useState(false);

    const current = useMemo(() => notices[index % notices.length], [index]);

    // Initialize from sessionStorage so we only show sequence once per session
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const done = sessionStorage.getItem('samara:noticesComplete') === '1';
            if (done) setCompleted(true);
        }
    }, []);

    useEffect(() => {
        if (completed) return; // stop cycling when completed/closed
        const showMs = 5000; // visible time
        const gapMs = 600; // small gap between cards
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => {
                if (index < notices.length - 1) {
                    setIndex((i) => i + 1);
                    setVisible(true);
                } else {
                    setCompleted(true);
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('samara:noticesComplete', '1');
                    }
                }
            }, gapMs);
        }, showMs);
        return () => clearTimeout(timer);
    }, [index, completed]);

    return (
        <>
            {!completed && (
                <div className={styles.container} aria-live="polite" aria-atomic="true">
                    <div className={`${styles.card} ${visible ? styles.in : styles.out}`} role="dialog" aria-modal="false">
                        <div className={styles.imageWrap}>
                            <button
                                className={styles.close}
                                onClick={() => {
                                    setVisible(false);
                                    setCompleted(true);
                                    if (typeof window !== 'undefined') {
                                        sessionStorage.setItem('samara:noticesComplete', '1');
                                    }
                                }}
                                aria-label="Close"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                            <Image src={current.image} alt="" width={0} height={0} className={styles.images} />
                            <span></span>
                        </div>
                        <h4 className={styles.title}>{current.title}</h4>
                        <p className={styles.body}>{current.body}</p>
                        {current.cta && (
                            <a className={styles.cta} href={current.cta.href}>
                                {current.cta.label}
                            </a>
                        )}
                    </div>
                </div>
            )}

            {completed && (
                <Link href="/chat" className={styles.fab} aria-label="Open chat">
                    <Image src={chatImg} alt="" width={0} height={0} className={styles.imagessss} />
                </Link>
            )}
        </>
    );
}


