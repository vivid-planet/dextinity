"use client";

import { usePreview } from "@dextinity/site-nextjs";
import clsx from "clsx";
import type { ReactElement } from "react";

import styles from "./AnimateBoxInOnLoad.module.scss";

interface AnimateBoxInOnLoadProps {
    direction?: "top" | "right" | "bottom" | "left";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: ReactElement<any>;
    delay?: number;
    duration?: number;
}

export function AnimateBoxInOnLoad({ children, direction = "bottom", delay = 0, duration }: AnimateBoxInOnLoadProps) {
    const { previewType } = usePreview();

    const style = {
        "--animation-delay": `${delay}ms`,
        ...(duration != null && { "--animation-duration": `${duration}ms` }),
    } as React.CSSProperties;

    return (
        <div
            className={clsx(
                styles.root,
                previewType !== "BlockPreview" && direction === "left" && styles.fromLeft,
                previewType !== "BlockPreview" && direction === "right" && styles.fromRight,
                previewType !== "BlockPreview" && direction === "top" && styles.fromTop,
                previewType !== "BlockPreview" && direction === "bottom" && styles.fromBottom,
            )}
            style={style}
        >
            {children}
        </div>
    );
}
