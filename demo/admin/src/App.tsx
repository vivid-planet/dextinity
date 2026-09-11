import "@fontsource-variable/roboto-flex/full.css";

import { ApolloProvider } from "@apollo/client";
import { ErrorDialogHandler, MasterLayout, MuiThemeProvider, RouterBrowserRouter, SnackbarProvider } from "@dextinity/admin";
import { DateFnsLocaleProvider } from "@dextinity/admin-date-time";
import { BrevoConfigProvider } from "@dextinity/brevo-admin";
import {
    AzureAiTranslatorProvider,
    type ContentScope,
    ContentScopeProvider,
    createDamFileDependency,
    CurrentUserProvider,
    DextinityConfigProvider,
    SitePreview,
} from "@dextinity/cms-admin";
import { css, Global } from "@emotion/react";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LicenseInfo } from "@mui/x-license";
import { createApolloClient } from "@src/common/apollo/createApolloClient";
import { createConfig } from "@src/config";
import { PageTreeNodeDependency } from "@src/pageTree/PageTreeNodeDependency";
import type { ContentScope as BaseContentScope } from "@src/site-configs";
import { createTheme } from "@src/theme";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { useMemo } from "react";
import { DndProvider } from "react-dnd-multi-backend";
import { FormattedMessage, IntlProvider } from "react-intl";
import { Route, Switch } from "react-router";

import { additionalPageTreeNodeFieldsFragment } from "./common/EditPageNode";
import MasterHeader from "./common/MasterHeader";
import { AppMasterMenu, AppMasterMenuRoutes, pageTreeDocumentTypes } from "./common/MasterMenu";
import { ImportFromPicsum } from "./dam/ImportFromPicsum";
import { Link } from "./documents/links/Link";
import { Page } from "./documents/pages/Page";
import type { GQLPermission } from "./graphql.generated";
import { getLanguageConfig } from "./lang";
import { NewsDetailBlock } from "./news/blocks/NewsDetailBlock";
import { NewsLinkBlock } from "./news/blocks/NewsLinkBlock";
import { NewsListBlock } from "./news/blocks/NewsListBlock";
import { NewsDependency } from "./news/dependencies/NewsDependency";
import { pageTreeCategories } from "./pageTree/pageTreeCategories";
import { RedirectDependency } from "./redirects/RedirectsDependency";

const GlobalStyle = () => (
    <Global
        styles={css`
            body {
                margin: 0;
            }
        `}
    />
);
const config = createConfig();
const apolloClient = createApolloClient(config.apiUrl);

declare module "@dextinity/cms-admin" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ContentScope extends BaseContentScope {}

    export interface PermissionOverrides {
        permission: GQLPermission;
    }
}

LicenseInfo.setLicenseKey(config.muiLicenseKey);

export function App() {
    const { language, messages, dateFnsLocale, muiLocale } = getLanguageConfig();
    const theme = useMemo(() => createTheme(muiLocale), [muiLocale]);

    return (
        <DextinityConfigProvider
            {...config}
            graphQLApiUrl={`${config.apiUrl}/graphql`}
            onError={(error, errorInfo) => {
                console.error("Error caught by error boundary", error, errorInfo.componentStack);
            }}
            pageTree={{
                categories: pageTreeCategories,
                documentTypes: pageTreeDocumentTypes,
                additionalPageTreeNodeFragment: additionalPageTreeNodeFieldsFragment,
                scopeParts: ["domain", "language"],
            }}
            redirects={{
                scopeParts: ["domain"],
            }}
            dataGrid={{
                component: DataGridPro,
            }}
            dam={{
                ...config.dam,
                scopeParts: ["domain"],
                additionalToolbarItems: <ImportFromPicsum />,
                importSources: {
                    picsum: {
                        label: <FormattedMessage id="dam.importSource.picsum.label" defaultMessage="Lorem Picsum" />,
                    },
                },
                contentGeneration: {
                    generateAltText: true,
                    generateImageTitle: true,
                },
            }}
            dependencies={{
                entityDependencyMap: {
                    Page,
                    Link,
                    News: NewsDependency,
                    Redirect: RedirectDependency,
                    PageTreeNode: PageTreeNodeDependency,
                    DamFile: createDamFileDependency(),
                },
            }}
            siteConfigs={{
                configs: config.siteConfigs,
                resolveSiteConfigForScope: (configs, scope) => {
                    const siteConfig = configs.find((config) => {
                        return config.scope.domain === scope.domain;
                    });

                    if (!siteConfig) {
                        throw new Error(`siteConfig not found for domain ${scope.domain}`);
                    }
                    return {
                        url: siteConfig.url,
                        preloginEnabled: siteConfig.preloginEnabled || false,
                        blockPreviewBaseUrl:
                            siteConfig.scope.domain === "secondary"
                                ? `${siteConfig.url}/block-preview`
                                : `${siteConfig.url}/block-preview/${scope.domain}/${scope.language}`,
                        sitePreviewApiUrl: `${siteConfig.url}/site-preview`,
                    };
                },
            }}
            buildInformation={{ date: config.buildDate, number: config.buildNumber, commitHash: config.commitSha }}
            contentLanguage={{ resolveContentLanguageForScope: (scope: ContentScope) => scope.language }}
            blocks={{
                isBlockSupported: (block, scope) => {
                    if (scope.domain === "main") {
                        return true;
                    } else {
                        return block.name !== NewsDetailBlock.name && block.name !== NewsListBlock.name && block.name !== NewsLinkBlock.name;
                    }
                },
            }}
        >
            <BrevoConfigProvider
                value={{
                    scopeParts: ["domain", "language"],
                    apiUrl: config.apiUrl,
                    resolvePreviewUrlForScope: (scope: ContentScope) => {
                        const siteConfig = config.siteConfigs.find((c) => c.scope.domain === scope.domain);
                        if (!siteConfig) {
                            throw new Error(`Could not find site config for domain ${scope.domain}`);
                        }
                        return `${siteConfig.url}/block-preview/${scope.domain}/${scope.language}/brevo-email-campaign`;
                    },
                    allowAddingContactsWithoutDoi: config.brevo.allowAddingContactsWithoutDoi,
                }}
            >
                <ApolloProvider client={apolloClient}>
                    <IntlProvider locale={language} messages={messages}>
                        <MuiThemeProvider theme={theme}>
                            <LocalizationProvider adapterLocale={dateFnsLocale} dateAdapter={AdapterDateFns}>
                                <DateFnsLocaleProvider value={dateFnsLocale}>
                                    <DndProvider options={HTML5toTouch}>
                                        <SnackbarProvider>
                                            <ErrorDialogHandler />
                                            <CurrentUserProvider>
                                                <RouterBrowserRouter>
                                                    <GlobalStyle />
                                                    <ContentScopeProvider>
                                                        {({ match }) => (
                                                            <AzureAiTranslatorProvider enabled showApplyTranslationDialog>
                                                                <Switch>
                                                                    <Route
                                                                        path={`${match.path}/preview`}
                                                                        render={(props) => (
                                                                            <SitePreview
                                                                                resolvePath={(path: string, scope) => {
                                                                                    return `/${scope.language}${path}`;
                                                                                }}
                                                                                {...props}
                                                                            />
                                                                        )}
                                                                    />
                                                                    <Route
                                                                        render={() => (
                                                                            <MasterLayout
                                                                                headerComponent={MasterHeader}
                                                                                menuComponent={AppMasterMenu}
                                                                            >
                                                                                <AppMasterMenuRoutes />
                                                                            </MasterLayout>
                                                                        )}
                                                                    />
                                                                </Switch>
                                                            </AzureAiTranslatorProvider>
                                                        )}
                                                    </ContentScopeProvider>
                                                </RouterBrowserRouter>
                                            </CurrentUserProvider>
                                        </SnackbarProvider>
                                    </DndProvider>
                                </DateFnsLocaleProvider>
                            </LocalizationProvider>
                        </MuiThemeProvider>
                    </IntlProvider>
                </ApolloProvider>
            </BrevoConfigProvider>
        </DextinityConfigProvider>
    );
}
