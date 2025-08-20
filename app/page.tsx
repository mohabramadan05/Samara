'use client';
import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import Categories from './components/Categories';
import BestSeller from './components/BestSeller';
import Hotdeals from './components/Hotdeals';
import Slogan from './components/slogan';
import New from './components/New';
import Reviews from './components/reviews';
import Partners from './components/Partners';
import NewsletterDialog from './shared_components/NewsletterDialog';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image';
import vege from './assets/vege.gif';




export default function Home() {
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowNewsletter(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    AOS.init({});
  }, []);

  useEffect(() => {
    const overlayTimer = setTimeout(() => setShowOverlay(false), 3000);
    return () => clearTimeout(overlayTimer);
  }, []);

  return (
    <>
      {showOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#252525',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-busy
          aria-live="polite"
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#333'
            }}
          >
            <Image src={vege} alt="loading" width={200} height={0} style={{
              height: 'auto'
            }} />
          </div>
        </div>
      )}
      <Hero />
      <Categories />
      <BestSeller />
      <Hotdeals />
      <Slogan />
      <New />
      <Partners />
      <Reviews />
      <NewsletterDialog isOpen={showNewsletter && !showOverlay} onClose={() => setShowNewsletter(false)} />
    </>
  );
}