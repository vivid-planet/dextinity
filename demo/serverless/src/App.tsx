import "@fontsource-variable/roboto-flex/full.css";

import { createDextinityTheme, MasterLayout, MuiThemeProvider, RouterBrowserRouter, SnackbarProvider } from "@dextinity/admin";
import {
    ApiProvider,
    BlocksProvider,
    CurrentUserProvider,
    DamApiProvider,
    DamPage,
    PageTreeApiProvider,
    PageTreePage,
    QueryErrorHandler,
    useCan,
    useCurrentUser,
} from "@dextinity/serverless/client";
import { css, Global } from "@emotion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FormattedMessage, IntlProvider } from "react-intl";
import { Redirect, Route, Switch } from "react-router";

import { imageAspectRatios } from "../shared/blocks";
import { MasterHeader } from "./MasterHeader";
import { MasterMenu } from "./MasterMenu";
import { pageTreeCategories, pageTreeDocumentTypes } from "./pageTreeConfig";

const theme = createDextinityTheme();
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export function App() {
    return (
        <IntlProvider locale="en" defaultLocale="en">
            <MuiThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <SnackbarProvider>
                        <QueryErrorHandler />
                        {/* The admin and the API are served by the same Worker */}
                        <ApiProvider apiUrl="/api">
                            <CurrentUserProvider>
                                <BlocksProvider allowedImageAspectRatios={[...imageAspectRatios]}>
                                    <DndProvider backend={HTML5Backend}>
                                        <RouterBrowserRouter>
                                            <Global styles={globalStyles} />
                                            <AppContent />
                                        </RouterBrowserRouter>
                                    </DndProvider>
                                </BlocksProvider>
                            </CurrentUserProvider>
                        </ApiProvider>
                    </SnackbarProvider>
                </QueryClientProvider>
            </MuiThemeProvider>
        </IntlProvider>
    );
}

function AppContent() {
    const { contentScopes } = useCurrentUser();
    const [scope, setScope] = useState(contentScopes[0]);
    const canUseDam = useCan("dam", scope);
    const canUsePageTree = useCan("pageTree", scope);

    return (
        <MasterLayout
            headerComponent={() => <MasterHeader scope={scope} scopes={contentScopes} onScopeChange={setScope} />}
            menuComponent={MasterMenu}
        >
            {scope ? (
                <DamApiProvider scope={scope}>
                    <PageTreeApiProvider
                        scope={scope}
                        categories={pageTreeCategories}
                        documentTypes={pageTreeDocumentTypes}
                        // The demo site's routes have a language, the serverless demo's scope has none
                        blockPreviewUrl={import.meta.env.SITE_URL && `${import.meta.env.SITE_URL}/block-preview/${scope.domain}/en`}
                    >
                        {/* Remounting on scope change resets the navigation state, folders and pages don't exist in other scopes */}
                        <Switch key={scope.domain}>
                            {canUsePageTree && (
                                <Route
                                    path="/pages/:category"
                                    render={({ match }) =>
                                        pageTreeCategories.some(({ category }) => category === match.params.category) ? (
                                            <PageTreePage key={match.params.category} category={match.params.category} />
                                        ) : (
                                            <Redirect to="/pages/mainNavigation" />
                                        )
                                    }
                                />
                            )}
                            {canUseDam && <Route path="/assets" render={() => <DamPage />} />}
                            <Redirect to={canUsePageTree ? "/pages/mainNavigation" : "/assets"} />
                        </Switch>
                    </PageTreeApiProvider>
                </DamApiProvider>
            ) : (
                <FormattedMessage id="app.noPermissions" defaultMessage="You have no permissions in this application." />
            )}
        </MasterLayout>
    );
}

const globalStyles = css`
    body {
        margin: 0;
    }
`;
