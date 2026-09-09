"use client";

import { usePreview } from "@dextinity/site-nextjs";
import clsx from "clsx";
import type { PropsWithChildren } from "react";

import styles from "./AnimateBoxInOnLoad.module.scss";

interface AnimateBoxInOnLoadProps {
    direction?: "top" | "right" | "bottom" | "left";
    delay?: number;
    duration?: number;
}

export function AnimateBoxInOnLoad({ children, direction = "bottom", delay = 0, duration }: PropsWithChildren<AnimateBoxInOnLoadProps>) {
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
