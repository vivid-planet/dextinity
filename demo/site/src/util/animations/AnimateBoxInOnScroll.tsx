"use client";

import { usePreview } from "@dextinity/site-nextjs";
import { useAnimateGroup } from "@src/util/animations/AnimateGroup";
import { useGlobalScrollSpeed } from "@src/util/animations/useGlobalScrollSpeed";
import { useWindowSize } from "@src/util/useWindowSize";
import clsx from "clsx";
import { type ReactNode, useEffect, useRef, useState } from "react";

import styles from "./AnimateBoxInOnScroll.module.scss";

interface AnimateBoxInOnScrollProps {
    direction?: "top" | "right" | "bottom" | "left";
    children: ReactNode;
    offset?: number;
    delay?: number;
    duration?: number;
    fullHeight?: boolean;
    onChange?: (inView: boolean) => void;
    className?: string;
    innerClassName?: string;
}

export function AnimateBoxInOnScroll({
    children,
    direction = undefined,
    offset = 200,
    delay = 0,
    duration = 500,
    fullHeight = false,
    onChange,
    className,
    innerClassName,
    ...props
}: AnimateBoxInOnScrollProps) {
    const animateGroup = useAnimateGroup();
    const refScrollContainer = useRef<HTMLDivElement | null>(null);
    const [triggerAnimation, setTriggerAnimation] = useState<boolean>(false);
    const { previewType } = usePreview();
    const windowSize = useWindowSize();
    const scrollSpeed = useGlobalScrollSpeed();

    const groupForceVisible = animateGroup?.visible ?? false;
    const groupOnVisible = animateGroup?.onVisible;
    const groupDisabled = animateGroup?.disabled ?? false;

    // When AnimateGroup is used and disabled in some breakpoints,
    // the delay should be 0 to avoid raised delay on elements below each other
    const effectiveDelay = groupDisabled ? 0 : delay;

    // Dynamic delay and animation duration for speedup animation on faster scrolling
    const dynamicDelay = scrollSpeed > 4 ? effectiveDelay / (scrollSpeed / 4) : effectiveDelay;
    const dynamicAnimationDuration = scrollSpeed > 4 ? Math.min(duration / (scrollSpeed / 4), 200) : duration;

    // Show immediately if element is already in view on page load
    useEffect(() => {
        const scrollContainer = refScrollContainer.current;
        if (!scrollContainer || previewType === "BlockPreview") {
            return;
        }

        const rect = scrollContainer.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            setTriggerAnimation(true);
            onChange?.(true);
            if (!groupDisabled) {
                groupOnVisible?.();
            }
        }
        // Mount-only: only the initial-in-view state should trigger this; re-running on prop changes would re-fire the animation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const scrollContainer = refScrollContainer.current;
        if (!scrollContainer || previewType === "BlockPreview") {
            return;
        }

        // Dynamic offset for trigger animation earlier on faster scrolling
        const dynamicOffsetScrollSpeed = Math.min(scrollSpeed > 2 ? scrollSpeed * 10 : 0, 300);
        // Dynamic offset page height for adjusting offset relative to page height
        const dynamicOffsetPageHeight = windowSize ? (windowSize?.height / 2.5) * -1 + offset : offset;
        const triggerAnimationOffset = dynamicOffsetScrollSpeed + dynamicOffsetPageHeight;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTriggerAnimation(true);
                        onChange?.(entry.isIntersecting);
                        if (!groupDisabled) {
                            groupOnVisible?.();
                        }
                    }
                });
            },
            {
                rootMargin: `0px 0px ${direction === "bottom" ? triggerAnimationOffset + 40 : direction === "top" ? triggerAnimationOffset - 40 : triggerAnimationOffset}px 0px`,
                threshold: 0,
            },
        );

        observer.observe(scrollContainer);

        return () => {
            if (scrollContainer) {
                observer.unobserve(scrollContainer);
            }
        };
    }, [offset, previewType, direction, windowSize, onChange, scrollSpeed, groupOnVisible, groupDisabled]);

    // Set CSS variable for delay and duration
    const style = {
        "--animation-delay": `${dynamicDelay ?? 0}ms`,
        "--animation-duration": `${dynamicAnimationDuration ?? 0}ms`,
        "--animation-transform-duration": `${dynamicAnimationDuration ? dynamicAnimationDuration * 2 : 0}ms`,
    } as React.CSSProperties;

    return (
        <div className={clsx(className)}>
            <div
                ref={refScrollContainer}
                onFocus={() => {
                    setTriggerAnimation(true);
                    groupOnVisible?.();
                }}
                className={clsx(
                    styles.scrollContainer,
                    fullHeight && styles.fullHeight,
                    direction === "left" && styles.fromLeft,
                    direction === "right" && styles.fromRight,
                    direction === "top" && styles.fromTop,
                    direction === "bottom" && styles.fromBottom,
                    (previewType === "BlockPreview" || triggerAnimation || groupForceVisible) && styles.animate,
                    innerClassName,
                )}
                style={style}
                {...props}
            >
                {children}
            </div>
        </div>
    );
}
