import type { OxlintConfig } from "oxlint";

export declare function resolvePlugin(specifier: string): string;

export declare const restrictedImportPatterns: Array<{ group: string[]; message: string }>;

declare const config: OxlintConfig;

export default config;
