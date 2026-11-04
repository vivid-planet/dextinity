"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { usePreview } from "../preview/usePreview";
import styles from "./PreviewSkeleton.module.scss";

interface SkeletonProps extends PropsWithChildren {
    type?: "bar" | "rows" | "media";
    aspectRatio?: string | number;
    height?: string | number;
    hasContent: boolean;
    backgroundColor?: string;
    color?: string;
    title?: ReactNode;
    customContainer?: ReactNode;
    fill?: boolean;
}

const PreviewSkeleton = ({
    children,
    customContainer,
    title,
    type = "bar",
    aspectRatio,
    height: passedHeight,
    hasContent,
    color = "#A8A7A8",
    backgroundColor = type === "media" ? "#efefef" : "#E0DDE0",
    fill = false,
}: SkeletonProps) => {
    const preview = usePreview();
    const validAspectRatio = getValidAspectRatio(aspectRatio);

    if (preview.showPreviewSkeletons && !hasContent) {
        if (customContainer) {
            return <>{customContainer}</>;
        } else if (type === "bar") {
            return (
                <div className={styles.barSkeleton} style={{ "--background-color": backgroundColor, "--color": color }}>
                    {title}
                </div>
            );
        } else if (type === "rows") {
            return (
                <div className={styles.rowsContainer}>
                    <div className={styles.rowSkeleton} style={{ "--width": "75%", "--background-color": backgroundColor, "--color": color }}>
                        {title}
                    </div>
                    <div className={styles.rowSkeleton} style={{ "--width": "100%", "--background-color": backgroundColor, "--color": color }} />
                    <div className={styles.rowSkeleton} style={{ "--width": "50%", "--background-color": backgroundColor, "--color": color }} />
                </div>
            );
        } else if (type === "media") {
            const height = fill ? "100%" : (passedHeight ?? 300);
            return (
                <div
                    className={styles.imageContainer}
                    style={{
                        "--background-color": backgroundColor,
                        "--color": color,
                        ...(validAspectRatio === undefined || fill
                            ? { "--height": typeof height === "string" ? height : `${height}px` }
                            : { "--aspect-ratio": validAspectRatio }),
                    }}
                >
                    {title}
                </div>
            );
        }
    }

    if (!hasContent) {
        return null;
    }

    return <>{children}</>;
};

const getValidAspectRatio = (aspectRatio: string | number | undefined) => {
    if (aspectRatio === "inherit") {
        // If "inherit" is passed to the image, the goal is for the NextJS's image component to use the image's original aspect ratio, not "inherit" as a CSS aspect ratio.
        // In that case, we cannot get the actual aspect ratio, so we use the fallback behavior in the skeleton.
        return undefined;
    }

    if (aspectRatio === "auto") {
        // The goal of using "auto" as a CSS aspect ratio is to use the image's original aspect ratio.
        // Since the image does not exist while the skeleton is shown, we use the fallback behavior in the skeleton.
        return undefined;
    }

    if (typeof aspectRatio === "string") {
        return aspectRatio.replace("x", "/");
    }

    return aspectRatio;
};

export { PreviewSkeleton };
