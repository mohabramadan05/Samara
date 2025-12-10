'use client'
import styles from './Policies.module.css';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const faqs = [
    {
        q: 'How can I order fruits, vegetables and groceries through your store?',
        a: 'You can order fruits, vegetables and groceries through our website or app, just browse the different categories, choose the products you want and add them to the shopping cart, then complete the payment process and choose the appropriate delivery method.'
    },
    {
        q: 'Are orders delivered on the same day?',
        a: 'Yes, in many cases orders are delivered on the same day if they are available in stock, otherwise the delivery period is up to a week, due to importing them from abroad.'
    },
    { q: 'Is there a minimum order?', a: 'No, there is no minimum order.' },
    {
        q: 'Can I customize the quantities or size of fruits, vegetables and groceries?',
        a: 'Yes, you can specify the quantities you need of fruits, vegetables and groceries, such as specifying the weight or number of pieces, and if the products come in specific packages, you can choose the number of packages.'
    },
    {
        q: 'Can I modify or cancel my order after it is confirmed?',
        a: 'Once the order is confirmed, the products are prepared quickly. So, if you want to modify or cancel the order, you should contact customer service as soon as possible, and if the order has already been shipped, modifications may not be possible.'
    },
    {
        q: 'How can I be sure of the quality of fruits and vegetables?',
        a: 'We are keen to provide fresh and high-quality products. However, if there is any quality problem, you can contact customer service to find a quick solution, such as replacing the product or refunding the amount.'
    },
    {
        q: 'Does the store offer discounts or special offers?',
        a: 'Yes, the store offers discounts and special offers from time to time, whether on special occasions or through Newsletter email subscriptions to receive updates on exclusive offers.'
    },
    { q: 'Are there additional delivery fees?', a: 'Yes, there is a fixed delivery fee of €5 regardless of your location.' },
    { q: 'Can I choose the delivery time?', a: 'Yes, you can choose the delivery time that suits you, when the delivery worker contacts you by phone on the day of delivery.' },
    { q: 'Can I track the status of my order?', a: 'Yes, you can track the status of your order through the website or application using the tracking number provided to you after the order is shipped. This will allow you to know where your order is and when it will arrive.' },
    { q: 'What happens if I am not home when the driver arrives?', a: 'If you are not present when the driver arrives, the delivery may be rescheduled for a later time.' },
    { q: 'Do you offer non-food products such as cleaning products and household supplies?', a: 'No, but we will work to provide them in case of increased demand.' },
    { q: 'Can I order products that are not currently available?', a: 'No.' },
    { q: 'Are frozen or refrigerated products delivered?', a: 'No, at the moment, but we will inform you when they are available in our store, or you can subscribe to our newsletter to receive updates first.' },
    { q: 'Can I exchange or return the products?', a: 'If the products are unsatisfactory or damaged, you can return or exchange them according to the store’s return policy. We usually give 24 hours to return unopened or unused products, as they are fresh products and more susceptible to rapid spoilage.' },
    { q: 'Can I pay upon receipt of the order?', a: 'No, online payment is only available at the moment.' },
    { q: 'Are orders delivered on holidays?', a: 'Yes.' },
    { q: 'How long does it take to deliver the order?', a: 'It may take up to a week from the date of order execution, due to the import of products from abroad.' },
    { q: 'How can I contact customer service?', a: 'You can contact customer service via the contact form on our website, email, or through the support service via social media (WhatsApp, Messenger, Instagram).' },
    { q: 'Can I add or remove products after submitting the order?', a: 'Since orders are processed quickly, adding or removing products after submitting the order may not be possible. Contact customer service as soon as possible if you wish to modify the order.' },
    { q: 'Are seasonal products provided?', a: 'Yes, seasonal fruits and vegetables are provided according to the local season. You can find these products in the seasonal sections within the website or application.' },
    { q: 'What are the available payment methods?', a: 'Our store provides several different payment methods such as payment using different credit cards (Visa, MasterCard, etc.) and electronic wallets (Google Pay, Apple Pay).' },
    { q: 'Can I get an electronic invoice?', a: 'Yes, you can get an electronic invoice once the payment process is completed. You can download it from your account on the website or receive it via email.' },
];

const Policies = () => {
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());



    const toggle = (index: number) => {
        setOpenItems(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index); else next.add(index);
            return next;
        });
    };

    return (
        <section className={styles.policies}>
            <h2 >Frequently Asked Questions (FAQs)</h2>
            <div>
                {faqs.map((item, idx) => {
                    const isOpen = openItems.has(idx);
                    return (
                        <div key={idx} className={styles.faqItem} >
                            <button
                                className={styles.faqQuestion}
                                onClick={() => toggle(idx)}
                                aria-expanded={isOpen}
                                aria-controls={`faq-answer-${idx}`}
                            >
                                <span className={styles.faqIndex}>{idx + 1}.</span>
                                <span className={styles.faqText}>{item.q}</span>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
                                />
                            </button>
                            <div
                                id={`faq-answer-${idx}`}
                                className={`${styles.faqAnswer} ${isOpen ? styles.show : ''}`}
                                role="region"
                                aria-hidden={!isOpen}
                            >
                                <p>{item.a}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Policies;