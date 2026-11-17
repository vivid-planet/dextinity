"use client";

import { useNavigationPending } from "@dextinity/site-vite-rsc";

import styles from "./NavigationProgress.module.scss";

export function NavigationProgress() {
    const isNavigationPending = useNavigationPending();
    return isNavigationPending ? <div className={styles.root} aria-hidden /> : null;
}
