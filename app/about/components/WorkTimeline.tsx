'use client'

import React from 'react';
import styles from './WorkTimeline.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
    faStore,
    faCreditCard,
    faTruck,
    faClock,
    faMoneyBillWave,
    faPhone,
    faHeadset,
    faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';

type Step = {
    title: string;
    description: string;
    icon: IconDefinition;
};

const steps: Step[] = [
    {
        title: 'Sales Method',
        description: 'Selling through the website or the application',
        icon: faStore,
    },
    {
        title: 'Payment Method',
        description: 'Payment via bank cards and electronic wallet',
        icon: faCreditCard,
    },
    {
        title: 'Delivery Service',
        description: 'Home delivery in all parts of the governorate',
        icon: faTruck,
    },
    {
        title: 'Delivery Time',
        description: 'Within two days of order arrival',
        icon: faClock,
    },
    {
        title: 'Shipping Cost',
        description: '€5 regardless of order value',
        icon: faMoneyBillWave,
    },
    {
        title: 'Contact Methods',
        description: 'WhatsApp number and social media channels',
        icon: faPhone,
    },
    {
        title: 'Customer Service',
        description: 'Available from 9 AM to 5 PM throughout the week',
        icon: faHeadset,
    },
    {
        title: 'Quality Guarantee',
        description:
            'Products are imported from suppliers who comply with international quality standards',
        icon: faCircleCheck,
    },
];

export default function WorkTimeline() {
    return (
        <section className={styles.section}>
            <h2 className={styles.heading}>How is <span>SAMARA</span> work!!!</h2>

            <div className={styles.timeline}>
                <div className={styles.line} />
                <div className={`${styles.endcap} ${styles.start}`} />
                {steps.map((step, index) => {
                    const sideClass = index % 2 === 0 ? styles.left : styles.right;
                    return (
                        <div key={index} className={`${styles.item} ${sideClass}`}>
                            <div className={styles.badge} aria-hidden>
                                <FontAwesomeIcon icon={step.icon} className={styles.icon} />
                            </div>
                            <div className={styles.card}>
                                <h3 className={styles.title}>{step.title}</h3>
                                <p className={styles.desc}>{step.description}</p>
                            </div>
                        </div>
                    );
                })}
                <div className={`${styles.endcap} ${styles.end}`} />
            </div>
        </section>
    );
}


