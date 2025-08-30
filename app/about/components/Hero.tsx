import Image from 'next/image';
import styles from './Hero.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import modelImage from '../../assets/about-model-image.png';
import Navbar from '../../shared_components/Navbar';
import { faTiktok, faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons';

const Hero = () => {
    return (
        <section className={styles.hero}>
            <Navbar />
            <div className={styles.textContent}>
                <div className={styles.supTextContent}>
                    <h3 className={styles.title}>About</h3>
                    <h1 className={styles.subTitle}>Samara</h1>

                    <div className={styles.buttons}>
                        <div className={styles.socialIcons}>
                            <a href="https://www.facebook.com/IrSamaraHub" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faFacebookF} className={styles.icon} />
                            </a>
                            <a href="https://www.tiktok.com/@irsamarahub" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faTiktok} className={styles.icon} />
                            </a>
                            <a href="https://instagram.com/irsamarahub" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faInstagram} className={styles.icon} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.imageWrapper}>

                <Image
                    src={modelImage}
                    alt="Samara Model"
                    width={575}
                    className={styles.modelImage}
                    priority
                />

            </div>
        </section>
    );
};

export default Hero; 