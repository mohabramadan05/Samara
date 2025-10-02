'use client'
import Image from 'next/image';
import styles from './Policies.module.css';
import donate from '../../assets/logo.png';
import health from '../../assets/healthimage.png';

const Policies = () => {

    return (
        <section className={styles.policies}>
            <h2 >Health and wellbeing At <span>Samara</span></h2>
            <div className={styles.health}>
                <Image className={styles.donate} src={donate} alt="Humanity First" width={250} height={250} />
                <Image className={styles.donate} src={health} alt="Humanity First" width={250} height={250} />
            </div>

            <p >
                Dear Valued Customer,
            </p>
            <p >
                At Samara, your health, satisfaction, and safety are at the heart of everything we do.<br />
                We are committed to providing you with high-quality food products that meet the highest standards. However, as individual dietary needs and sensitivities may vary, we kindly urge you to carefully review the ingredients listed on each product before consumption.
            </p>
            <p >
                If you have any known allergies or sensitivities, we strongly advise verifying that the product is suitable for your needs.<br />
                Your wellbeing is our priority, and we are always here to support you with any inquiries you may have.
            </p>
            <p >
                Thank you for your trust.
            </p>
            <p >
                Warm regards,
            </p>
            <p ><strong>Samara Team</strong></p>

        </section>
    );
};

export default Policies; 