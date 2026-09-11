import clsx from "clsx";

import styles from "./AiContentDisclosure.module.scss";
import { AiGeneratedBlackIcon } from "./icons/AiGeneratedBlackIcon";
import { AiGeneratedWhiteIcon } from "./icons/AiGeneratedWhiteIcon";
import { AiModifiedBlackIcon } from "./icons/AiModifiedBlackIcon";
import { AiModifiedWhiteIcon } from "./icons/AiModifiedWhiteIcon";

export type AiContentType = "Generated" | "Modified";

const icons = {
    Generated: { black: AiGeneratedBlackIcon, white: AiGeneratedWhiteIcon },
    Modified: { black: AiModifiedBlackIcon, white: AiModifiedWhiteIcon },
} satisfies Record<AiContentType, { black: unknown; white: unknown }>;

export interface AiContentDisclosureProps {
    /** Which EU label to show: fully AI-generated or partially AI-modified content. */
    type: AiContentType;
    /** Icon height in pixels. Defaults to 28. */
    size?: number;
    /**
     * "black" (default) shows the black EU label with a light halo; "white" shows the white
     * EU label with a dark halo. The halo keeps the label legible against arbitrary imagery either way.
     */
    iconColor?: "black" | "white";
    /** Prevent the badge from being positioned absolutely in relation to its parent. Default: false. */
    disableAbsolutePositioning?: boolean;
    /**
     * Corner to place the badge in when it is positioned absolutely. Defaults to "topRight" so the badge
     * doesn't overlap video playback controls (which sit at the bottom).
     */
    position?: "bottomLeft" | "topRight";
    className?: string;
}

/**
 * Visual AI-content disclosure badge using the official EU AI-content labels (Article 50 AI Act).
 *
 * The EU label sits on a scrim (light behind the black label, dark behind the white one) so it stays
 * legible against arbitrary imagery, as required by the Code of Practice ("remain visible against any
 * background").
 *
 * The badge is decorative (`aria-hidden`): the machine-readable disclosure must be carried by the
 * accessible name of the associated media element (see `getAiContentAltTextWithPrefix`), so screen-reader
 * users learn which asset is AI-generated.
 */
export function AiContentDisclosure({
    type,
    size = 28,
    iconColor = "black",
    disableAbsolutePositioning = false,
    position = "topRight",
    className,
}: AiContentDisclosureProps) {
    const Icon = icons[type][iconColor];

    return (
        <span
            className={clsx(
                styles.root,
                styles[iconColor],
                !disableAbsolutePositioning && styles.overlay,
                !disableAbsolutePositioning && styles[position],
                className,
            )}
            style={{ "--ai-content-disclosure-icon-size": `${size}px` }}
            aria-hidden="true"
        >
            <Icon className={styles.icon} />
        </span>
    );
}
