import { useDextinityConfig } from "../config/DextinityConfigContext";
import type { SiteConfigsConfig } from "./siteConfigsConfig";

export function useSiteConfigs<Configs = unknown>(): SiteConfigsConfig<Configs> {
    const dextinityConfig = useDextinityConfig<Configs>();

    if (!dextinityConfig.siteConfigs) {
        throw new Error("No site configs configuration found. Make sure to set `siteConfigs` in `DextinityConfigProvider`.");
    }

    return dextinityConfig.siteConfigs;
}
