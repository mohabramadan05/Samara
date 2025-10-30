'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';
import loading1 from '../assets/vege.gif';

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkPaymentStatus = async () => {

      try {
        // 1️⃣ Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) console.error('⚠️ Supabase user error:', userError);
        if (!user) throw new Error('No logged-in user found.');

        // 2️⃣ Get today’s pending orders
        const startOfDay = dayjs().startOf('day').toISOString();
        const endOfDay = dayjs().endOf('day').toISOString();

        const { data: pendingOrders, error: dbError } = await supabase
          .from('order_payment_confirmation')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'PENDING')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);

        if (dbError) throw dbError;

        if (!pendingOrders?.length) {
          return;
        }

        // 3️⃣ Check SumUp for each order
        await Promise.all(
          pendingOrders.map(async (order) => {
            if (!order.checkout_id) {
              return;
            }

            const response = await fetch('/api/sumup/check-sumup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ checkout_id: order.checkout_id }),
            });

            const result = await response.json();

            const sumupStatus = result.data.status || 'UNKNOWN';

            // ✅ Update only if confirmed as PAID
            if (sumupStatus === 'PAID') {
              const { error: updateError } = await supabase
                .from('order_payment_confirmation')
                .update({
                  status: 'PAID',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', order.id);

              if (updateError) console.error('❌ Update error:', updateError);
              else console.log('✅ Order updated to PAID:', order.id);
            } else {
              console.log('⏳ Payment still pending for order:', order.id);
            }

            router.push(`/order-details/${order.id}`);
          })
        );
      } catch (err) {
        console.error('❌ Payment check error:', err);
      } finally {
        setLoading(false);
        console.log('🏁 Finished payment check process.');
      }
    };

    checkPaymentStatus();
  }, [router]);

  return (
    <div className={styles.sec}>
      <Image src={loading1} width={250} height={250} alt="map" />
      <p className={styles.text}>Please wait while preparing your order</p>
      <p className={styles.text2}>thanks for trusting Samara</p>
      
    </div>
  );
}
