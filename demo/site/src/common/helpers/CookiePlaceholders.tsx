import { useCookieApi } from "@dextinity/site-nextjs";

import styles from "./CookiePlaceholders.module.scss";

export const LoadingCookiePlaceholder = () => (
    <div className={styles.root}>
        <h4>Loading cookie provider...</h4>
    </div>
);

export const FallbackCookiePlaceholder = () => {
    const { openCookieSettings } = useCookieApi();

    return (
        <div className={styles.root}>
            <h4>Cookies need to be accepted to view this content.</h4>
            <button onClick={() => openCookieSettings()}>Open Cookie Settings</button>
        </div>
    );
};
