import styles from "./ProductLogo.module.scss";
import { dextinityLogo, dextinityLogoNegative, dextinitySign, groupCmsAiLogo, groupCmsAiLogoNegative, groupCmsSign } from "./productLogos";

/**
 * The product logo for shell stories: the GroupCMS AI logo in the `groupcms-ai` brand, the Dextinity logo otherwise, each switching to
 * the negative version in dark color schemes.
 */
export function ProductLogo() {
    return (
        <span className={styles.root}>
            <img src={dextinityLogo} alt="Dextinity" className={`${styles.dextinity} ${styles.positive}`} />
            <img src={dextinityLogoNegative} alt="Dextinity" className={`${styles.dextinity} ${styles.negative}`} />
            <img src={groupCmsAiLogo} alt="GroupCMS AI" className={`${styles.groupCmsAi} ${styles.positive}`} />
            <img src={groupCmsAiLogoNegative} alt="GroupCMS AI" className={`${styles.groupCmsAi} ${styles.negative}`} />
        </span>
    );
}

/**
 * The product sign for the collapsed navigation in shell stories.
 */
export function ProductSign() {
    return (
        <span className={styles.root}>
            <img src={dextinitySign} alt="Dextinity" className={`${styles.dextinity} ${styles.sign}`} />
            <img src={groupCmsSign} alt="GroupCMS AI" className={`${styles.groupCmsAi} ${styles.sign}`} />
        </span>
    );
}
