import { useEffect, useState } from "react";
import { FormattedDate, FormattedTime } from "react-intl";

import styles from "./OverviewPage.module.css";

export function OverviewClock() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const interval = window.setInterval(() => setNow(new Date()), 15_000);
        return () => window.clearInterval(interval);
    }, []);

    return (
        <>
            <div className={styles.clock}>
                <FormattedTime value={now} hour="numeric" minute="2-digit" />
            </div>
            <div className={styles.clockLabel}>
                <FormattedDate value={now} weekday="long" day="numeric" month="long" year="numeric" />
            </div>
        </>
    );
}
