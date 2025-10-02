'use client'
import styles from './Policies.module.css';

const Policies = () => {

    return (
        <section className={styles.policies}>
            <h2>Delivery Coverage and Policy – Samara 🚚</h2>
            <p >
                At Samara, we care deeply about your convenience and satisfaction. That’s why we’ve designed a delivery system that is safe, reliable, and tailored to your needs.<br /><br />
                <strong>Where We Deliver 📍</strong><br />
                Currently, we offer delivery services across Dublin County, including:
            </p>
            <ul>
                <li >Dublin City Centre (Dublin 1, 2, 4)</li>
                <li >North Dublin (Dublin 3, 5, 7, 9, 11, 13, 15)</li>
                <li >South Dublin (Dublin 6, 6W, 8, 10, 12, 14, 16, 18, 20, 22, 24)</li>
                <li >Surrounding areas within Dublin County</li>
            </ul>
            <p >
                We are actively working to expand our delivery coverage across all counties in Ireland to make it easier for everyone to access their favorite Egyptian products — delivered fresh, and at fair prices.<br /><br />
                <strong>Delivery Times 🕒</strong><br />
            </p>
            <ul>
                <li >Operating Days: Weekend Only (Saturday, Sunday)</li>
                <li >Delivery Hours: From 10:00 AM to 07:00 PM</li>
                <li >Orders placed after 6:00 PM may be scheduled for next weekend-days delivery.</li>
            </ul>
            <p >
                <strong>Delivery Timeframe⏱️</strong><br />
            </p>
            <ul>
                <li >Most orders are delivered within 48 hours of shipment arrival.</li>
                <li >During peak times or in bad weather, slight delays may occur — we’ll keep you informed every step of the way.</li>
            </ul>
            <p >
                <strong>Delivery Fees 💶</strong><br />
            </p>
            <ul>
                <li >Free delivery on all orders above €50</li>
                <li >For orders below €50, a €4.99 flat fee applies</li>
            </ul>
            <p >
                <strong>Additional Notes 🛒</strong><br />
            </p>
            <ul>
                <li >All items are packed with care to maintain freshness and quality.</li>
                <li >Please ensure your address and contact number are correct to avoid delays.</li>
                <li >If delivery cannot be completed due to incorrect details or no one being available to receive the order, a redelivery fee may apply.</li>
            </ul>
        </section>
    );
};

export default Policies; 