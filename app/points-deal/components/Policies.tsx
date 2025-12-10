'use client'
import styles from './Policies.module.css';

const Policies = () => {


    return (
        <section className={styles.policies}>
            <h2>Earn Points with Every Purchase… and Redeem Them for Real Products!��</h2>
            <p >
                Now, every time you shop on our website, you’re not just getting great products delivered to your door — you’re also earning reward points that you can turn into real money to shop again! 👇
            </p>
            <p >
                <strong>How Do You Earn Points? 💡</strong>
            </p>
            <ul>
                <li >✔️ If products costs €5, you get 1 point</li>
                <li >✔️ If the product costs between €5 and €10, you get 2 points</li>
                <li >✔️ If the product costs €10, you get 2 points</li>
                <li >✔️ If the product costs €15, you get 3 points</li>
                <li >✔️ And so on… Every extra €5 earns you 1 additional point</li>
            </ul>
            <p >
                So the more you shop, the more points you collect!🎯
            </p>
            <p >
                <strong>How to Use Your Points?🎁</strong>
            </p>
            <p >
                Once your balance reaches 300 points, you can redeem them for €10 credit, which you can use directly on your next purchase!
            </p>
            <p >
                <strong>Do Points Expire?⏳</strong>
            </p>
            <p >
                Not at all!✅<br />
                Your points never expire, so you can keep them as long as you want and use them whenever you’re ready.
            </p>
        </section>
    );
};

export default Policies; 