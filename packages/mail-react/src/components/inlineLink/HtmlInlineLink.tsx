import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { css } from "../../utils/css.js";
import { useOutlookTextStyle } from "../text/OutlookTextStyleContext.js";

export type HtmlInlineLinkProps = Omit<ComponentProps<"a">, "target"> & {
    /**
     * Where to open the linked document.
     *
     * @defaultValue `"_blank"`
     */
    target?: ComponentProps<"a">["target"];
};

/**
 * Inline link styled to match the surrounding text, for use inside `HtmlText` or `MjmlText`.
 *
 * Applies explicit text styles from the parent text component's context so that
 * Outlook Desktop (which overrides `<a>` tags with its built-in "Hyperlink" style)
 * renders the link with the correct font and color.
 */
export function HtmlInlineLink({ className, style, target = "_blank", ...restProps }: HtmlInlineLinkProps): ReactNode {
    const outlookTextStyle = useOutlookTextStyle();

    const baseStyle = {
        fontFamily: outlookTextStyle?.fontFamily ?? "inherit",
        fontSize: outlookTextStyle?.fontSize ?? "inherit",
        lineHeight: outlookTextStyle?.lineHeight ?? "inherit",
        fontWeight: outlookTextStyle?.fontWeight ?? "inherit",
        color: outlookTextStyle?.color ?? "inherit",
        textDecoration: "underline" as const,
    };

    return <a className={clsx("htmlInlineLink", className)} style={{ ...baseStyle, ...style }} target={target} {...restProps} />;
}

registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .htmlInlineLink {
                font-family: inherit !important;
                font-size: inherit !important;
                line-height: inherit !important;
                font-weight: inherit !important;
                color: inherit !important;
            }
        }
    `,
);
