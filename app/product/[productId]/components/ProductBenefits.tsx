import styles from './ProductDetail.module.css';

interface ProductBenefitsProps {
  benefits?: string;
}

const ProductBenefits = ({ benefits }: ProductBenefitsProps) => {
  if (!benefits) return null;

  return (
    <div className={styles.benefitsSection}>
      <h2 className={styles.sectionTitle}>Benefits:</h2>
      <div className={styles.benefitsList}>
        <p>{benefits}</p>
      </div>
    </div>
  );
};

export default ProductBenefits;
