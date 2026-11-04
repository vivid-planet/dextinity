import { type IMjmlImageProps, MjmlImage as BaseMjmlImage } from "@faire/mjml-react";
import { MjmlHtml } from "@faire/mjml-react/extensions/index.js";
import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { css } from "../../utils/css.js";
import { hideFromOutlookEndComment, hideFromOutlookStartComment } from "../../utils/outlookConditionalComment.js";
import { generateOutlookImageVml, generateOutlookImageVmlRow } from "./outlookVml.js";

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
export function MjmlImage({
    className,
    borderRadius,
    src,
    width,
    height,
    alt,
    href,
    align,
    padding,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    ...restProps
}: MjmlImageProps): ReactNode {
    const imageNode = (
        <BaseMjmlImage
            className={clsx("mjmlImage", className)}
            borderRadius={borderRadius}
            src={src}
            width={width}
            height={height}
            alt={alt}
            href={href}
            align={align}
            padding={padding}
            paddingTop={paddingTop}
            paddingRight={paddingRight}
            paddingBottom={paddingBottom}
            paddingLeft={paddingLeft}
            {...restProps}
        />
    );

    const outlookImageVml = src === undefined ? null : generateOutlookImageVml({ src, width, height, borderRadius, alt, href });

    if (outlookImageVml === null) {
        return imageNode;
    }

    return (
        <>
            <MjmlHtml html={generateOutlookImageVmlRow({ outlookImageVml, align, padding, paddingTop, paddingRight, paddingBottom, paddingLeft })} />
            <MjmlHtml html={hideFromOutlookStartComment} />
            {imageNode}
            <MjmlHtml html={hideFromOutlookEndComment} />
        </>
    );
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
