'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import styles from './BackToTop.module.css';

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down 300px
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Listen for scroll events
        window.addEventListener('scroll', toggleVisibility);

        // Cleanup
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            className={`${styles.backToTop} ${isVisible ? styles.visible : ''}`}
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
        >
            <FontAwesomeIcon icon={faChevronUp} className={styles.icon} />
        </button>
    );
}
