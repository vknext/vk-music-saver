import styles from './Badges.module.scss';
import PrimeDeluxe from './PrimeDeluxe';

const Badges = ({ children }: { children: React.ReactNode }) => {
	return <div className={styles.Wrapper}>{children}</div>;
};

Badges.PrimeDeluxe = PrimeDeluxe;

export default Badges;
