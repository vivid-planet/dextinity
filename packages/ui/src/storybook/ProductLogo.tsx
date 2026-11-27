import styles from "./ProductLogo.module.scss";
import { aiHubLogo, aiHubLogoNegative, aiHubSign, dextinityLogo, dextinityLogoNegative, dextinitySign } from "./productLogos";

const logos = [
    { brand: "dextinity", name: "Dextinity", positive: dextinityLogo, negative: dextinityLogoNegative, sign: dextinitySign },
    { brand: "ai-hub", name: "Dextinity AI Hub", positive: aiHubLogo, negative: aiHubLogoNegative, sign: aiHubSign },
];

/**
 * The product logo for shell stories: the logo of the surrounding brand, the Dextinity logo for a brand without one of its own,
 * each switching to the negative version in dark color schemes.
 */
export function ProductLogo() {
    return (
        <span className={styles.root}>
            {logos.map(({ brand, name, positive, negative }) => [
                <img key={`${brand}-positive`} src={positive} alt={name} data-logo-brand={brand} className={styles.positive} />,
                <img key={`${brand}-negative`} src={negative} alt={name} data-logo-brand={brand} className={styles.negative} />,
            ])}
        </span>
    );
}

/**
 * The product sign of the surrounding brand, for the collapsed navigation in shell stories.
 */
export function ProductSign() {
    return (
        <span className={styles.root}>
            {logos.map(({ brand, name, sign }) => (
                <img key={brand} src={sign} alt={name} data-logo-brand={brand} className={styles.sign} />
            ))}
        </span>
    );
}
