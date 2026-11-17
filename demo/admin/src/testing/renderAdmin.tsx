import { MuiThemeProvider, RouterMemoryRouter } from "@dextinity/admin";
import { createTheme } from "@src/theme";
import { render, type RenderResult } from "@testing-library/react";
import { type ReactElement, StrictMode } from "react";
import { IntlProvider } from "react-intl";

const theme = createTheme([]);

/**
 * Renders an admin component under the intl context, the project theme, and the router of `App.tsx`. The intl context
 * carries no catalog, so every message resolves to its `defaultMessage`.
 *
 * `useCurrentUser` throws without its provider and says so. `useContentScope` does not: without a `ContentScopeProvider`,
 * it matches the default path `/` and returns an empty scope. A spec that depends on the scope wraps its tree in
 * `ContentScopeProvider`.
 *
 * `isStrictMode` wraps the whole tree in `StrictMode`, as `loader.tsx` does. Further down the tree, it doesn't run the
 * effects a second time.
 */
export function renderAdmin(ui: ReactElement, { route = "/", isStrictMode = false }: { route?: string; isStrictMode?: boolean } = {}): RenderResult {
    const tree = (
        <IntlProvider locale="en">
            <MuiThemeProvider theme={theme}>
                <RouterMemoryRouter initialEntries={[route]}>{ui}</RouterMemoryRouter>
            </MuiThemeProvider>
        </IntlProvider>
    );

    return render(isStrictMode ? <StrictMode>{tree}</StrictMode> : tree);
}
