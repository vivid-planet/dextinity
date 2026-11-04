import { type IMjmlWrapperProps, MjmlWrapper as BaseMjmlWrapper } from "@faire/mjml-react";
import type { ReactNode } from "react";

import { useOptionalTheme } from "../../theme/ThemeProvider.js";
import { InsideMjmlWrapperContext } from "./InsideMjmlWrapperContext.js";

export type MjmlWrapperProps = Omit<IMjmlWrapperProps, "backgroundColor"> & {
    /**
     * Background color of the wrapper.
     *
     * @defaultValue The theme's `colors.background.content`
     */
    backgroundColor?: IMjmlWrapperProps["backgroundColor"];
};

/**
 * A wrapper that groups multiple sections sharing a background. Must be a direct child of `MjmlBody`.
 */
export function MjmlWrapper({ children, ...restProps }: MjmlWrapperProps): ReactNode {
    const theme = useOptionalTheme();

    const themeBackgroundProps = theme ? { backgroundColor: theme.colors.background.content } : {};

    return (
        <BaseMjmlWrapper {...themeBackgroundProps} {...restProps}>
            <InsideMjmlWrapperContext.Provider value={true}>{children}</InsideMjmlWrapperContext.Provider>
        </BaseMjmlWrapper>
    );
}
