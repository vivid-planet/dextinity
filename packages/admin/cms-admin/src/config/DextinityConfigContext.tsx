import { ErrorHandlerProvider } from "@dextinity/admin";
import type { DataGridProps } from "@mui/x-data-grid";
import type { DataGridPremiumProps } from "@mui/x-data-grid-premium";
import type { DataGridProProps } from "@mui/x-data-grid-pro";
import { type ComponentType, createContext, type ErrorInfo, type PropsWithChildren, useContext } from "react";

import { type BlocksConfig, BlocksConfigProvider } from "../blocks/config/BlocksConfigContext";
import type { BlockContext } from "../blocks/context/BlockContext";
import { BlockContextProvider } from "../blocks/context/BlockContextProvider";
import type { BuildInformation } from "../common/header/about/build-information/buildInformation";
import type { ContentLanguageConfig } from "../contentLanguage/contentLanguageConfig";
import type { DamConfig } from "../dam/config/damConfig";
import type { DependenciesConfig } from "../dependencies/dependenciesConfig";
import type { PageTreeConfig } from "../pages/pageTreeConfig";
import type { RedirectsConfig } from "../redirects/redirectsConfig";
import type { SiteConfigsConfig } from "../siteConfigs/siteConfigsConfig";
import type { WarningsConfig } from "../warnings/warningsConfig";

export interface DextinityConfig<SiteConfigs = unknown> {
    apiUrl: string;
    graphQLApiUrl: string;
    adminUrl: string;
    pageTree?: PageTreeConfig;
    dam?: DamConfig;
    redirects?: RedirectsConfig;
    dependencies?: DependenciesConfig;
    siteConfigs?: SiteConfigsConfig<SiteConfigs>;
    buildInformation?: BuildInformation;
    contentLanguage?: ContentLanguageConfig;
    blocks?: BlocksConfig & {
        context?: Omit<BlockContext, "apiUrl" | "apolloClient">;
    };
    warnings?: WarningsConfig;
    dataGrid?: {
        component?: ComponentType<DataGridProps> | ComponentType<DataGridProProps> | ComponentType<DataGridPremiumProps>;
    };
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

const DextinityConfigContext = createContext<DextinityConfig | undefined>(undefined);

export function DextinityConfigProvider<SiteConfigs = unknown>({ children, ...config }: PropsWithChildren<DextinityConfig<SiteConfigs>>) {
    const { context: blockContext = {}, ...blocksConfig } = config.blocks ?? {};

    return (
        <DextinityConfigContext.Provider value={config as DextinityConfig<unknown>}>
            <ErrorHandlerProvider onError={config.onError}>
                <BlockContextProvider value={blockContext}>
                    <BlocksConfigProvider {...blocksConfig}>{children}</BlocksConfigProvider>
                </BlockContextProvider>
            </ErrorHandlerProvider>
        </DextinityConfigContext.Provider>
    );
}

export function useDextinityConfig<SiteConfigs = unknown>() {
    const context = useContext(DextinityConfigContext);

    if (!context) {
        throw new Error(
            "No DextinityConfigContext instance can be found. Please ensure that you have called `DextinityConfigProvider` higher up in your tree.",
        );
    }

    return context as DextinityConfig<SiteConfigs>;
}
