/* eslint-disable no-console */
import { execSync } from "child_process";
import { Command } from "commander";
import { randomUUID } from "crypto";
import fs from "fs";
import { resolve } from "path";

import type { BaseSiteConfig, ExtractPrivateSiteConfig, ExtractPublicSiteConfig } from "../site-configs.types";

export const injectSiteConfigsCommand = new Command("inject-site-configs")
    .description("Inject site-configs into a file")
    .requiredOption("-i, --in-file <file>", "The filename of a template file to inject.")
    .requiredOption("-o, --out-file <file>", "Write the injected template to a file.")
    .option("--base64", "use base64 encoding")
    .option("-f, --site-config-file <file>", "Path to ts-file which provides a default export with (env: string) => SiteConfig[]")
    .action(async (options) => {
        const configFile = `${process.cwd()}/${options.siteConfigFile || "site-configs.ts"}`;
        const getSiteConfigs: (env: string) => BaseSiteConfig[] = (await import(configFile)).default;

        const siteConfigsCache = new Map<string, BaseSiteConfig[]>();
        const getCachedSiteConfigs = async (env: string): Promise<BaseSiteConfig[]> => {
            let cached = siteConfigsCache.get(env);
            if (!cached) {
                cached = await getSiteConfigs(env);
                siteConfigsCache.set(env, cached);
            }
            return cached;
        };

        console.log(`inject-site-configs: Replace site-configs in ${options.inFile}`);

        let str = fs.readFileSync(resolve(process.cwd(), options.inFile)).toString();

        const getUrlFromDomain = (domain: string): string => {
            return domain.includes("localhost") ? `http://${domain}` : `https://${domain}`;
        };

        const replacerFunctions: Record<string, (siteConfigs: BaseSiteConfig[], env: string) => unknown> = {
            private: (siteConfigs: BaseSiteConfig[], env: string): ExtractPrivateSiteConfig<BaseSiteConfig>[] =>
                siteConfigs.map((siteConfig) =>
                    (({ public: publicVars, ...rest }) => ({
                        ...publicVars,
                        ...rest,
                        url: getUrlFromDomain(siteConfig.domains.preliminary ?? siteConfig.domains.main),
                        preloginEnabled: siteConfig.preloginEnabled ?? !["prod", "local"].includes(env),
                    }))(siteConfig),
                ),
            public: (siteConfigs: BaseSiteConfig[]): ExtractPublicSiteConfig<BaseSiteConfig>[] =>
                siteConfigs.map((siteConfig) => ({
                    ...siteConfig.public,
                    name: siteConfig.name,
                    domains: siteConfig.domains,
                    preloginEnabled: siteConfig.preloginEnabled || false,
                    url: getUrlFromDomain(siteConfig.domains.preliminary ?? siteConfig.domains.main),
                })),
        };
        str = str.replace(/"({{ site:\/\/configs\/.*\/.* }})"/g, "'$1'"); // convert to single quotes
        const siteConfigsPlaceholderPattern = /{{ site:\/\/configs\/(.*)\/(.*) }}/g;
        const siteConfigsJsonByPlaceholder = new Map<string, string>();
        for (const [placeholder, type, env] of Array.from(str.matchAll(siteConfigsPlaceholderPattern))) {
            if (siteConfigsJsonByPlaceholder.has(placeholder)) {
                continue;
            }
            const siteConfigs = await getCachedSiteConfigs(env);
            console.log(`inject-site-configs: - ${placeholder} (${siteConfigs.length} sites)`);
            if (replacerFunctions[type] == undefined) {
                console.error(`inject-site-configs: ERROR: type must be ${Object.keys(replacerFunctions).join("|")} (got ${type})`);
                continue;
            }
            siteConfigsJsonByPlaceholder.set(placeholder, JSON.stringify(replacerFunctions[type](siteConfigs, env)));
        }

        // Resolve before the base64 encoding, which would hide the op:// references from a later `op inject` step.
        const resolvedSiteConfigsJson = resolveOpReferences(Array.from(siteConfigsJsonByPlaceholder.values()));
        const resolvedSiteConfigsJsonByPlaceholder = new Map(
            Array.from(siteConfigsJsonByPlaceholder.keys(), (placeholder, index) => [placeholder, resolvedSiteConfigsJson[index]]),
        );
        str = str.replace(siteConfigsPlaceholderPattern, (placeholder) => {
            const siteConfigsJson = resolvedSiteConfigsJsonByPlaceholder.get(placeholder);
            if (siteConfigsJson === undefined) {
                return placeholder;
            }
            if (options.base64) {
                return Buffer.from(siteConfigsJson).toString("base64");
            }
            return siteConfigsJson.replace(/\\/g, "\\\\");
        });

        str = str.replace(/"({{ site:\/\/domains\/.*\/.* }})"/g, "$1"); // remove quotes in array
        str = await replaceAsync(str, /{{ site:\/\/domains\/(site|prelogin)\/(.*) }}/g, async (substr, type, env) => {
            const siteConfigs = await getCachedSiteConfigs(env);
            console.log(`inject-site-domains: - ${substr} (${siteConfigs.length} sites)`);
            if (type === "site") {
                const filteredSiteConfigs = siteConfigs.filter((d) => !d.preloginEnabled);
                return JSON.stringify([
                    ...filteredSiteConfigs.map((d) => d.domains.main),
                    ...filteredSiteConfigs.filter((d) => d.domains.additional).flatMap((d) => d.domains.additional),
                ]);
            } else if (type === "prelogin") {
                return JSON.stringify([
                    ...siteConfigs.filter((d) => d.preloginEnabled).map((d) => d.domains.main),
                    ...siteConfigs.filter((d) => d.domains.preliminary).map((d) => d.domains.preliminary),
                ]);
            }
            throw new Error('type must be "site", "prelogin"');
        });

        fs.writeFileSync(resolve(process.cwd(), options.outFile), str);
    });

const opReferencePattern = /\{\{ op:\/\/[^ }]+ \}\}/g;

export const resolveOpReferences = (inputs: string[]): string[] => {
    const opRefs = Array.from(new Set(inputs.flatMap((input) => input.match(opReferencePattern) ?? [])));
    if (opRefs.length === 0) {
        return inputs;
    }

    try {
        execSync("op --version", { stdio: "ignore" });
    } catch {
        throw new Error(
            "inject-site-configs: Config contains 1Password references (op://) but the 1Password CLI (op) is not installed. " +
                "Install from https://developer.1password.com/docs/cli/",
        );
    }

    const secrets = readSecrets(opRefs);
    return inputs.map((input) => input.replace(opReferencePattern, (ref) => secrets.get(ref) ?? ref));
};

// A single `op inject` call is much faster than one `op read` per reference and counts against the
// 1Password rate limits only once. The random separator keeps multi-line secrets apart.
const readSecrets = (opRefs: string[]): Map<string, string> => {
    const separator = `\n${randomUUID()}\n`;
    let output: string;
    try {
        output = execSync("op inject", { input: opRefs.join(separator), encoding: "utf-8" });
    } catch (e) {
        throw new Error(`inject-site-configs: Failed to resolve 1Password references: ${e}`);
    }

    const secrets = output.split(separator);
    if (secrets.length !== opRefs.length) {
        throw new Error(`inject-site-configs: Failed to resolve 1Password references: expected ${opRefs.length} secrets, got ${secrets.length}`);
    }

    return new Map(
        opRefs.map((ref, index) => {
            console.log(`inject-site-configs: - Resolved ${ref}`);
            return [ref, secrets[index].trim()];
        }),
    );
};

// https://stackoverflow.com/a/75205316
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const replaceAsync = async (str: string, regex: RegExp, asyncFn: (match: any, ...args: any) => Promise<any>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promises: Promise<any>[] = [];
    str.replace(regex, (match, ...args) => {
        promises.push(asyncFn(match, ...args));
        return match;
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
};
