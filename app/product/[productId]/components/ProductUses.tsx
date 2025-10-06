import styles from './ProductDetail.module.css';

interface ProductUsesProps {
    uses?: string;
}

const ProductUses = ({ uses }: ProductUsesProps) => {
    let usesText = uses?.trim();

    // Default fallback if no uses provided
    if (!usesText) {
        usesText = ``;
    }

    return (
        <div className={styles.usesSection}>
            <h2 className={styles.sectionTitle}>Uses:</h2>
            <div className={styles.usesList}>
                <p>{usesText}</p>
            </div>
        </div>
    );
};

export default ProductUses;
