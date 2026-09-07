"use client";

import { usePreview } from "@dextinity/site-nextjs";
import clsx from "clsx";
import type { CSSProperties, PropsWithChildren } from "react";

import styles from "./AnimateBoxInOnScroll.module.scss";

interface AnimateBoxInOnScrollProps {
    direction?: "top" | "right" | "bottom" | "left";
    offset?: number;
    delay?: number;
    className?: string;
}

/*
 * The reveal runs on the box's view progress timeline, so it is scrubbed by scroll position instead of playing over
 * a duration. `offset` and `delay` keep the units they had while the animation was time-based and are converted to
 * positions inside the box's entry range here: every 100px of `offset` finishes the reveal 10% earlier, every 100ms
 * of `delay` shifts it 8% of the range later.
 */
const offsetToRangeEnd = (offset: number) => Math.min(Math.max(80 - offset / 10, 20), 80);
const delayToStagger = (delay: number) => delay / 100;

const directionStyles = {
    top: styles.fromTop,
    right: styles.fromRight,
    bottom: styles.fromBottom,
    left: styles.fromLeft,
};

export function AnimateBoxInOnScroll({ children, direction, offset = 200, delay = 0, className }: PropsWithChildren<AnimateBoxInOnScrollProps>) {
    const { previewType } = usePreview();

    const style = {
        "--animation-range-end": `${offsetToRangeEnd(offset)}%`,
        "--animation-stagger": delayToStagger(delay),
    } as CSSProperties;

    // The block preview shows a single block out of the page context, where there is nothing to scroll it into view.
    const animate = previewType !== "BlockPreview";

    return (
        <div className={className}>
            <div className={clsx(animate && styles.scrollContainer, animate && direction && directionStyles[direction])} style={style}>
                {children}
            </div>
        </div>
    );
}
