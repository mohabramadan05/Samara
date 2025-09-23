'use client'
import styles from './Policies.module.css';
import Link from 'next/link';

const Policies = () => {

    return (
        <section className={styles.policies}>
            <h2>Refund Policy – Samara Store</h2>
            <p>
                At Samara, your satisfaction is our top priority. We are committed to delivering fresh, high-quality food products and understand the importance of trust when shopping online for groceries. That’s why we offer a clear and reasonable refund policy designed to protect both our customers and our business.
            </p>
            <hr />
            <p><strong>Items Eligible for Return or Replacement:✅</strong></p>
            <p>When Can You Request a Refund or Replacement?</p>
            <ul>
                <li>You received a damaged or spoiled product.</li>
                <li>The product received is different from what you ordered.</li>
                <li>Delivery was delayed by more than 48 hours without prior notice or coordination.</li>
            </ul>
            <hr />
            <p><strong>Items Not Eligible for Return: ❌</strong></p>
            <ul>
                <li>Items that have been opened or partially used.</li>
                <li>Fresh or chilled products (e.g., fruits, vegetables, dairy, meats) unless they are spoiled or damaged.</li>
                <li>Any product that was delivered correctly and matches the description.</li>
            </ul>
            <hr />
            <p><strong>Timeframe to Request a Refund:⏳</strong></p>
            <ul>
                <li>Refund requests must be submitted within 24 hours of receiving your order.</li>
                <li>Requests made after this period will not be accepted due to the perishable nature of our products.</li>
            </ul>
            <hr />
            <p><strong>Refund Conditions:📦</strong></p>
            <ul>
                <li>A clear photo of the damaged or incorrect product must be provided.</li>
                <li>The product must be in its original condition (unopened and unused).</li>
                <li>Our customer service team will review the request within 24 hours.</li>
            </ul>
            <hr />
            <p><strong>Refund Method:💰</strong></p>
            <ul>
                <li>The amount will be refunded to the original payment method within 7 business days.</li>
            </ul>
            <hr />
            <p><strong>How to Request a Return: 💬</strong></p>
            <p>To request a refund please follow as it shown below…</p>
            <ul>
                <li>Contact us via WhatsApp, email, or the support section on our website.</li>
                <li>Provide your order number and clear images of the issue.</li>
                <li>We will review and respond within 24 hours.</li>
                <li><Link  href="mailto:support@samarashop.ie"><span className={styles.policiesLink}>support@samarashop.ie</span></Link></li>
                <li><Link  href="https://wa.me/0894641409">WhatsApp: <span className={styles.policiesLink}>0894-641-409</span></Link></li>
            </ul>
            <hr/>
            <p>Thank you for choosing Samara. We’re proud to bring the taste of home to your doorstep – right here in Ireland 🇮🇪.</p>
        </section>
    );
};

export default Policies; 