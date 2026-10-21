import type { OxlintConfig } from "oxlint";

export declare const restrictedImportPaths: Array<{ name: string; importNames?: string[]; message?: string }>;

export declare const disabledReactCompilerRules: NonNullable<OxlintConfig["rules"]>;

declare const config: OxlintConfig;

export default config;
