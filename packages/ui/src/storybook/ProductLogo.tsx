import styles from "./ProductLogo.module.scss";
import { dextinityLogo, dextinityLogoNegative, dextinitySign } from "./productLogos";

/**
 * The Dextinity logo for shell stories, switching to the negative version in dark color schemes.
 */
export function ProductLogo() {
    return (
        <span className={styles.root}>
            <img src={dextinityLogo} alt="Dextinity" className={styles.positive} />
            <img src={dextinityLogoNegative} alt="Dextinity" className={styles.negative} />
        </span>
    );
}

/**
 * The Dextinity sign for the collapsed navigation in shell stories.
 */
export function ProductSign() {
    return <img src={dextinitySign} alt="Dextinity" className={styles.sign} />;
}
