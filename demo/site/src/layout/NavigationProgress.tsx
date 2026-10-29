"use client";

import { useNavigationPending } from "@src/framework/RouterProvider";

import styles from "./NavigationProgress.module.scss";

export function NavigationProgress() {
    const isNavigationPending = useNavigationPending();
    return isNavigationPending ? <div className={styles.root} aria-hidden /> : null;
}
