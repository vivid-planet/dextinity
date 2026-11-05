import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Badge } from "../badge/Badge";
import { Icon } from "../icon/Icon";
import styles from "./AssetThumbnail.module.scss";

export type AssetThumbnailType = "image" | "video" | "document" | "folder";
export type AssetThumbnailRatio = "4:3" | "1:1" | "original";
export type AssetThumbnailBadge = "ai" | "missingAlt";

/** A point in an image, as fractions of its width and height: `{ x: 0, y: 0 }` is the top left corner, `{ x: 1, y: 1 }` the bottom right. */
export interface FocalPoint {
    x: number;
    y: number;
}

export interface AssetThumbnailLabels {
    /** The explanation of the `ai` badge. */
    ai: string;
    /** The explanation of the `missingAlt` badge. */
    missingAlt: string;
}

const defaultLabels: AssetThumbnailLabels = {
    ai: "AI-generated",
    missingAlt: "Alt text missing",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type AssetThumbnailOwnerState = {
    type: AssetThumbnailType;
    ratio: AssetThumbnailRatio;
    selected: boolean;
};

export interface AssetThumbnailSlotProps {
    /** Props for the `preview` slot, the framed picture. */
    preview?: SlotPropsValue<AssetThumbnailOwnerState, "div">;
    /** Props for the `image` slot. */
    image?: SlotPropsValue<AssetThumbnailOwnerState, "img">;
    /** Props for the `badges` slot, the badges in the top right corner. */
    badges?: SlotPropsValue<AssetThumbnailOwnerState, "span">;
    /** Props for the `caption` slot, which holds the name and the meta line. */
    caption?: SlotPropsValue<AssetThumbnailOwnerState, "div">;
}

export interface AssetThumbnailProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** What the asset is: images and videos show their picture, documents their first page, folders a folder. */
    type: AssetThumbnailType;
    /** The URL of the preview picture. Leave it out for folders, and for documents without a page preview. */
    src?: string;
    /** The picture's text alternative. Leave it out when the name next to it already describes the asset. */
    alt?: string;
    /**
     * The point the crop is centered on.
     *
     * @defaultValue `{ x: 0.5, y: 0.5 }`
     */
    focalPoint?: FocalPoint;
    /**
     * The crop: `4:3` and `1:1` crop around the focal point, `original` keeps the picture's own proportions.
     *
     * @defaultValue `"4:3"`
     */
    ratio?: AssetThumbnailRatio;
    /** Exceptions to point out in the top right corner: `ai` for AI-generated pictures (EU AI Act), `missingAlt` for a missing alt text. */
    badges?: ReadonlyArray<AssetThumbnailBadge>;
    /** The file format shown in the bottom left corner of documents, e.g. "PDF". */
    fileType?: string;
    /** The length shown next to the play mark of videos, e.g. "0:42". */
    duration?: string;
    /** The file or folder name below the picture. */
    name?: ReactNode;
    /** Details below the name, e.g. "JPG · 2.4 MB" or "12 items". */
    meta?: ReactNode;
    /**
     * Marks the asset as selected with a ring.
     *
     * @defaultValue `false`
     */
    selected?: boolean;
    /** The badges' explanations, shown as tooltips. */
    labels?: Partial<AssetThumbnailLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: AssetThumbnailSlotProps;
}

function toPercent(value: number) {
    return `${Math.round(Math.min(1, Math.max(0, value)) * 1000) / 10}%`;
}

/**
 * The preview of a file or folder: the picture cropped around its focal point, badges for exceptions, and an optional name and meta
 * line.
 */
export const AssetThumbnail = forwardRef<HTMLDivElement, AssetThumbnailProps>(function AssetThumbnail(
    {
        type,
        src,
        alt = "",
        focalPoint,
        ratio = "4:3",
        badges = [],
        fileType,
        duration,
        name,
        meta,
        selected = false,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: AssetThumbnailOwnerState = { type, ratio, selected };

    const previewProps = resolveSlotProps<AssetThumbnailOwnerState, "div", "div">({
        ownProps: { className: styles.preview },
        slotProps: slotProps?.preview,
        ownerState,
    });
    const imageProps = resolveSlotProps<AssetThumbnailOwnerState, "img", "img">({
        ownProps: {
            className: styles.image,
            src,
            alt,
            draggable: false,
            style: { objectPosition: `${toPercent(focalPoint?.x ?? 0.5)} ${toPercent(focalPoint?.y ?? 0.5)}` } satisfies CSSProperties,
        },
        slotProps: slotProps?.image,
        ownerState,
    });
    const badgesProps = resolveSlotProps<AssetThumbnailOwnerState, "span", "span">({
        ownProps: { className: styles.badges },
        slotProps: slotProps?.badges,
        ownerState,
    });
    const captionProps = resolveSlotProps<AssetThumbnailOwnerState, "div", "div">({
        ownProps: { className: styles.caption },
        slotProps: slotProps?.caption,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-type={ownerState.type}
            data-ratio={ownerState.ratio}
            data-selected={ownerState.selected ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...previewProps}>
                {ownerState.type === "folder" ? (
                    <span className={styles.folder} aria-hidden="true" />
                ) : src != null ? (
                    <img {...imageProps} />
                ) : (
                    <span className={styles.placeholder} aria-hidden="true">
                        <Icon name={ownerState.type === "image" ? "image" : ownerState.type === "video" ? "play" : "page"} />
                    </span>
                )}
                {ownerState.type === "video" && (
                    <span className={styles.typeMark}>
                        <Icon name="play" />
                        {duration}
                    </span>
                )}
                {ownerState.type === "document" && fileType != null && <span className={styles.typeMark}>{fileType}</span>}
                {badges.length > 0 && (
                    <span {...badgesProps}>
                        {badges.map((badge) =>
                            badge === "ai" ? (
                                <Badge key={badge} variant="ai" tooltip={labels.ai} />
                            ) : (
                                <Badge key={badge} variant="warning" tooltip={labels.missingAlt} />
                            ),
                        )}
                    </span>
                )}
            </div>
            {(name != null || meta != null) && (
                <div {...captionProps}>
                    {name != null && <span className={styles.name}>{name}</span>}
                    {meta != null && <span className={styles.meta}>{meta}</span>}
                </div>
            )}
        </div>
    );
});
