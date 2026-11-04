import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";

import { HtmlText } from "../../components/text/HtmlText.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import type { RichTextBlockTypeProps } from "./common.js";

export type BlockTypeTextProps = Omit<RichTextBlockTypeProps, "list">;

export type BlockTextProps = PropsWithChildren<
    BlockTypeTextProps & {
        /** Whether the theme's spacing below the text applies — set for every text block except the last. */
        bottomSpacing: boolean;
    }
>;

export function MjmlBlockText({ bottomSpacing, variant, className, fontWeight, children, ...styleProps }: BlockTextProps): ReactNode {
    return (
        <MjmlText
            variant={variant}
            bottomSpacing={bottomSpacing}
            className={clsx("richTextBlock__text", className)}
            // Spread conditionally: MjmlText spreads explicit props after the theme-resolved variant
            // props, so an explicit `fontWeight={undefined}` would erase the variant's value.
            {...(fontWeight !== undefined && { fontWeight: String(fontWeight) })}
            {...styleProps}
        >
            {children}
        </MjmlText>
    );
}

export function HtmlBlockText({ bottomSpacing, variant, className, children, ...styleProps }: BlockTextProps): ReactNode {
    return (
        <HtmlText element="div" variant={variant} bottomSpacing={bottomSpacing} className={clsx("richTextBlock__text", className)} style={styleProps}>
            {children}
        </HtmlText>
    );
}
