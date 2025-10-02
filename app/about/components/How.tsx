'use client'
import Image from 'next/image';
import styles from './How.module.css';
import logo from '../../assets/logo1.png';


const How = () => {


    return (
        <section className={styles.how}>
            <div className={styles.textContent}>
                <h2  className={styles.title}>Who Are We ?</h2>
                <p  className={styles.description}>
                    Samara is an Arabic brand,specializing in selling high quality Arabic products that are distinguished by their arabic authenticity.Samara Established in 2024 and its goal is to feel good and return to using our authentic arabic products.<br /><br />
                    At Samara, we believe in the beauty of tradition and the power of high-quality, natural ingredients. Our carefully curated selection of products is designed to reconnect people with their cultural roots, promoting a lifestyle that is both luxurious and deeply meaningful.
                </p>
            </div>
            <div  className={styles.imageWrapper}>
                <Image
                    src={logo}
                    alt="Samara Logo"
                    width={700}
                    className={styles.modelImage}
                    priority
                />
            </div>
        </section>
    );
};

export default How; 