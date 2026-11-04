import { Mjml, MjmlAll, MjmlAttributes, MjmlBody, MjmlBreakpoint, MjmlHead } from "@faire/mjml-react";
import type { PropsWithChildren, ReactNode } from "react";

import { type Config, ConfigProvider } from "../../config/ConfigProvider.js";
import { Styles } from "../../styles/Styles.js";
import { createTheme } from "../../theme/createTheme.js";
import { ThemeProvider } from "../../theme/ThemeProvider.js";
import type { Theme } from "../../theme/themeTypes.js";

type MjmlMailRootProps = PropsWithChildren<{
    /**
     * Theme to use for the email.
     *
     * @defaultValue `createTheme()`
     */
    theme?: Theme;
    /** Extra content appended inside the built-in `<MjmlAttributes>`, after the default `<MjmlAll>`. */
    attributes?: ReactNode;
    /** Extra content appended inside `<MjmlHead>`, after the registered styles block. */
    head?: ReactNode;
    /**
     * Configuration to make available to descendants via `useConfig`.
     */
    config?: Config;
}>;

/**
 * The root element for email templates. Renders the standard MJML email skeleton
 * (`<Mjml>`, `<MjmlHead>`, `<MjmlBody>`) with `<MjmlAll padding={0} />` as the
 * default attribute so all components start with zero padding.
 *
 * Accepts an optional `theme` prop that controls the body width and responsive breakpoints. The theme is made available to all descendant components via `useTheme()`.
 *
 * Accepts an optional `config` prop containing configuration. When provided, the value is made available to descendants via `useConfig()`.
 *
 * Direct children should be section-level components (e.g. `MjmlSection`).
 */
export function MjmlMailRoot({ theme: themeProp, attributes, head, config, children }: MjmlMailRootProps): ReactNode {
    const theme = themeProp ?? createTheme();

    const content = (
        <ThemeProvider theme={theme}>
            <Mjml>
                <MjmlHead>
                    <MjmlAttributes>
                        <MjmlAll padding="0" fontFamily={theme.text.fontFamily} />
                        {attributes}
                    </MjmlAttributes>
                    <MjmlBreakpoint width={`${theme.breakpoints.mobile.value}px`} />
                    <Styles />
                    {head}
                </MjmlHead>
                <MjmlBody width={theme.sizes.bodyWidth} backgroundColor={theme.colors.background.body}>
                    {children}
                </MjmlBody>
            </Mjml>
        </ThemeProvider>
    );

    if (config) {
        return <ConfigProvider config={config}>{content}</ConfigProvider>;
    }

    return content;
}
