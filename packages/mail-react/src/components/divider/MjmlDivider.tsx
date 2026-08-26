import { MjmlRaw } from "@faire/mjml-react";
import clsx from "clsx";
import type { ReactNode } from "react";

import { useOptionalTheme } from "../../theme/ThemeProvider.js";
import type { DividerProps } from "./dividerProps.js";
import { HtmlDivider } from "./HtmlDivider.js";

export type MjmlDividerProps = DividerProps;

/**
 * Themed divider.
 *
 * Must be placed within an `MjmlColumn`. For raw HTML context (e.g. inside `MjmlRaw`),
 * use `HtmlDivider` instead.
 */
export function MjmlDivider({ variant, height, backgroundColor, backgroundImage, className, style }: MjmlDividerProps): ReactNode {
    const theme = useOptionalTheme();
    const activeVariant = variant ?? theme?.divider.defaultVariant;

    return (
        <MjmlRaw>
            <tr>
                <td style={{ padding: 0, fontSize: 0, lineHeight: 0, msoLineHeightRule: "exactly" }}>
                    <HtmlDivider
                        variant={variant}
                        height={height}
                        backgroundColor={backgroundColor}
                        backgroundImage={backgroundImage}
                        className={clsx("mjmlDivider", activeVariant && `mjmlDivider--${activeVariant}`, className)}
                        style={style}
                    />
                </td>
            </tr>
        </MjmlRaw>
    );
}
