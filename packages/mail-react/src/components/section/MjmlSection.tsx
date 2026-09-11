import { type IMjmlGroupProps, type IMjmlSectionProps, MjmlGroup, MjmlSection as BaseMjmlSection } from "@faire/mjml-react";
import clsx from "clsx";
import type { ReactNode } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { generateResponsiveTokenCss } from "../../styles/responsiveCss.js";
import { getDefaultFromResponsiveValue } from "../../theme/responsiveValue.js";
import { useOptionalTheme } from "../../theme/ThemeProvider.js";
import type { Theme } from "../../theme/themeTypes.js";
import { useIsInsideMjmlWrapper } from "../wrapper/InsideMjmlWrapperContext.js";

export type MjmlSectionProps = Omit<IMjmlSectionProps, "backgroundColor"> & {
    /**
     * Background color of the section.
     *
     * @defaultValue The theme's `colors.background.content`, unless inside an `MjmlWrapper`
     */
    backgroundColor?: IMjmlSectionProps["backgroundColor"];
    /** Applies theme-based content indentation with responsive overrides. */
    indent?: boolean;
    /** When true, child columns remain side-by-side on mobile instead of stacking vertically. */
    disableResponsiveBehavior?: boolean;
    /** Props forwarded to internal sub-components. */
    slotProps?: {
        /** Props passed to the wrapping `MjmlGroup` when `disableResponsiveBehavior` is enabled. */
        group?: Partial<IMjmlGroupProps>;
    };
};

/** A section wrapper for email layouts. Must be a direct child of `MjmlBody` or `MjmlWrapper`. */
export function MjmlSection({ children, indent, disableResponsiveBehavior, slotProps, className, ...restProps }: MjmlSectionProps): ReactNode {
    const theme = useOptionalTheme();
    const isInsideWrapper = useIsInsideMjmlWrapper();

    const indentProps = indent ? getIndentProps(theme) : {};
    const resolvedClassName = clsx("mjmlSection", indent && "mjmlSection--indented", className);

    const themeBackgroundProps = theme && !isInsideWrapper ? { backgroundColor: theme.colors.background.content } : {};

    return (
        <BaseMjmlSection className={resolvedClassName} {...themeBackgroundProps} {...indentProps} {...restProps}>
            {disableResponsiveBehavior ? <MjmlGroup {...slotProps?.group}>{children}</MjmlGroup> : <>{children}</>}
        </BaseMjmlSection>
    );
}

function getIndentProps(theme: Theme | null): Pick<IMjmlSectionProps, "paddingLeft" | "paddingRight"> {
    if (theme === null) {
        throw new Error("The `indent` prop requires being wrapped in a ThemeProvider or MjmlMailRoot.");
    }

    return {
        paddingLeft: getDefaultFromResponsiveValue(theme.sizes.contentIndentation),
        paddingRight: getDefaultFromResponsiveValue(theme.sizes.contentIndentation),
    };
}

registerStyles((theme) =>
    generateResponsiveTokenCss({
        breakpoints: theme.breakpoints,
        selector: ".mjmlSection--indented > table > tbody > tr > td",
        tokens: [
            { value: theme.sizes.contentIndentation, cssProperty: "padding-left", unit: "px" },
            { value: theme.sizes.contentIndentation, cssProperty: "padding-right", unit: "px" },
        ],
    }),
);
