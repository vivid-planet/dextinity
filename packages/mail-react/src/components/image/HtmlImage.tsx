import clsx from "clsx";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { css } from "../../utils/css.js";
import { hideFromOutlookEndComment, hideFromOutlookStartComment, showOnlyInOutlook } from "../../utils/outlookConditionalComment.js";
import { generateOutlookImageVml } from "./outlookVml.js";

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
export function HtmlImage({ className, borderRadius, style, src, width, height, alt, ...restProps }: HtmlImageProps): ReactNode {
    const imageStyle: CSSProperties = { borderRadius, ...style };

    const imageNode = (
        <img className={clsx("htmlImage", className)} style={imageStyle} src={src} width={width} height={height} alt={alt} {...restProps} />
    );

    const outlookImageVml = src === undefined ? null : generateOutlookImageVml({ src, width, height, borderRadius: imageStyle.borderRadius, alt });

    if (outlookImageVml === null) {
        return imageNode;
    }

    return (
        <>
            <span
                style={collapsedSpanStyle}
                dangerouslySetInnerHTML={{ __html: `${showOnlyInOutlook(outlookImageVml)}${hideFromOutlookStartComment}` }}
            />
            {imageNode}
            <span style={collapsedSpanStyle} dangerouslySetInnerHTML={{ __html: hideFromOutlookEndComment }} />
        </>
    );
}

const collapsedSpanStyle: CSSProperties = { fontSize: 0, lineHeight: 0 };

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
