import clsx from "clsx";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { css } from "../../utils/css.js";

export type HtmlImageProps = ComponentProps<"img"> & {
    /** Corner radius of the image. */
    borderRadius?: CSSProperties["borderRadius"];
};

/**
 * Renders an `<img>` tag that adapts to its container width below the default
 * breakpoint.
 *
 * Use within raw HTML context — HTML-only emails or
 * [MJML ending tags](https://documentation.mjml.io/#ending-tags) like `MjmlRaw`.
 * Inside `MjmlRaw` in an `MjmlColumn`, place `HtmlImage` in a `<tr>` and `<td>` of its own.
 * For MJML context, use `MjmlImage`.
 */
export function HtmlImage({ className, borderRadius, style, ...restProps }: HtmlImageProps): ReactNode {
    return <img className={clsx("htmlImage", className)} style={{ borderRadius, ...style }} {...restProps} />;
}

registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .htmlImage {
                width: 100%;
                height: auto;
            }
        }
    `,
);
