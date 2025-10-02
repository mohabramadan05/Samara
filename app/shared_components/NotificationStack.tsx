'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './NotificationStack.module.css';
import Image, { StaticImageData } from 'next/image';
import pointsImg from '@/app/assets/popups/box.png';
import deliveryImg from '@/app/assets/popups/del.png';
import donateImg from '@/app/assets/popups/don.png';
import discountImg from '@/app/assets/popups/50.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
// ChatFab decoupled; rendered globally

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
    const [visible, setVisible] = useState(false);
    const [completed, setCompleted] = useState(false);
    const timerRef = useRef<number | null>(null);

    const delayMs = 60_000; // 1 minute
    const current = useMemo(() => notices[index % notices.length], [index]);

    // Initialize: if not completed this session, show first notice after 1 minute
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const done = sessionStorage.getItem('samara:noticesComplete') === '1';
        if (done) {
            setCompleted(true);
            return;
        }
        timerRef.current = window.setTimeout(() => {
            setVisible(true);
        }, delayMs);
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, []);

    // Clear any pending timers when sequence completes
    useEffect(() => {
        if (!completed) return;
        if (timerRef.current) window.clearTimeout(timerRef.current);
    }, [completed]);

    const handleClose = () => {
        setVisible(false);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        if (index < notices.length - 1) {
            // After user closes, wait 1 minute then show next card
            timerRef.current = window.setTimeout(() => {
                setIndex((i) => i + 1);
                setVisible(true);
            }, delayMs);
        } else {
            setCompleted(true);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('samara:noticesComplete', '1');
            }
        }
    };

    return (
        <>
            {!completed && (
                <div className={styles.container} aria-live="polite" aria-atomic="true">
                    <div className={`${styles.card} ${visible ? styles.in : styles.out}`} role="dialog" aria-modal="false">
                        <div className={styles.imageWrap}>
                            <button
                                className={styles.close}
                                onClick={handleClose}
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

            {null}
        </>
    );
}


