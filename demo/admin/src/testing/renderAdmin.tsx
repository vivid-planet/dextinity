import { MuiThemeProvider, RouterMemoryRouter } from "@dextinity/admin";
import { createTheme } from "@src/theme";
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { IntlProvider } from "react-intl";

const theme = createTheme([]);

/**
 * Renders an admin component under the intl context, the project theme, and the router of `App.tsx`. The intl context
 * carries no catalog, so every message resolves to its `defaultMessage`.
 *
 * `useCurrentUser` throws without its provider and says so. `useContentScope` does not: it falls back to a default
 * context and parses the scope out of `route`.
 */
export function renderAdmin(ui: ReactElement, { route = "/" }: { route?: string } = {}): RenderResult {
    return render(
        <IntlProvider locale="en">
            <MuiThemeProvider theme={theme}>
                <RouterMemoryRouter initialEntries={[route]}>{ui}</RouterMemoryRouter>
            </MuiThemeProvider>
        </IntlProvider>,
    );
}
