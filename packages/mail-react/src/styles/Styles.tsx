import { MjmlStyle } from "@faire/mjml-react";
import type { ReactNode } from "react";

import { useTheme } from "../theme/ThemeProvider.js";
import { minifyHeadCss } from "./minifyHeadCss.js";
import { getRegisteredStyles, type StylesPayload } from "./registerStyles.js";

/** Internal component that renders the styles registry into `<MjmlStyle>` elements. */
export function Styles(): ReactNode {
    const theme = useTheme();
    const entries = Array.from(getRegisteredStyles().values());

    function resolveCss(styles: StylesPayload): string {
        return typeof styles === "function" ? styles(theme) : styles;
    }

    const combinedStyleTagCss = entries
        .filter((entry) => !entry.mjmlStyleProps?.inline)
        .map((entry) => resolveCss(entry.styles))
        .filter(Boolean)
        .join("\n");

    const entriesToInline = entries.filter((entry) => entry.mjmlStyleProps?.inline);

    return (
        <>
            {combinedStyleTagCss ? <MjmlStyle>{minifyHeadCss(combinedStyleTagCss)}</MjmlStyle> : null}
            {entriesToInline.map((entry, index) => (
                <MjmlStyle key={index} {...entry.mjmlStyleProps}>
                    {resolveCss(entry.styles)}
                </MjmlStyle>
            ))}
        </>
    );
}
