import { type IMjmlImageProps, MjmlImage as BaseMjmlImage } from "@faire/mjml-react";
import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { css } from "../../utils/css.js";

export type MjmlImageProps = Omit<IMjmlImageProps, "borderRadius"> & {
    /** Corner radius of the image. */
    borderRadius?: CSSProperties["borderRadius"];
};

/**
 * Renders an MJML image that adapts to the viewport width below the default breakpoint.
 *
 * Must be placed within an `MjmlColumn`. For raw HTML context (e.g. inside `MjmlRaw`),
 * use `HtmlImage` instead.
 */
export function MjmlImage({ className, borderRadius, ...restProps }: MjmlImageProps): ReactNode {
    return <BaseMjmlImage className={clsx("mjmlImage", className)} borderRadius={borderRadius} {...restProps} />;
}

// MJML inlines a fixed `height` on the inner <img>; !important overrides it for responsive scaling.
registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .mjmlImage img {
                height: auto !important;
            }
        }
    `,
);
