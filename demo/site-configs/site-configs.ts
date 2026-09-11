import { SiteConfig } from "./site-configs.d";
import main from "./main";
import secondary from "./secondary";

// Types for files in site-configs/
export type Environment = "local";
export type GetSiteConfig = (env: Environment) => SiteConfig;

const isValidEnvironment = (env: string): env is Environment => {
    return ["local", "dev", "test", "staging", "prod"].includes(env);
};

// Called by `pnpm exec dextinity inject-site-configs`
const getSiteConfigs = (env: string): SiteConfig[] => {
    if (!isValidEnvironment(env)) {
        throw new Error(`Invalid environment: ${env}`);
    }

    const imports = [main, secondary];
    return imports.map((getSiteConfig) => {
        return getSiteConfig(env);
    });
};
export default getSiteConfigs;
