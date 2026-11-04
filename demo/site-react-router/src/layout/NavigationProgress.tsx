"use client";

"use client";

import { useNavigation } from "react-router";

import styles from "./NavigationProgress.module.scss";

export function NavigationProgress() {
    const isNavigationPending = useNavigation().state !== "idle";
    return isNavigationPending ? <div className={styles.root} aria-hidden /> : null;
}
