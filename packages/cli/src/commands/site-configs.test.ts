import type { ExecSyncOptions } from "child_process";
import fs from "fs";
import os from "os";
import { join } from "path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveOpReferences } from "./site-configs";

const { execSyncMock } = vi.hoisted(() => ({ execSyncMock: vi.fn() }));

vi.mock("child_process", () => ({
    execSync: execSyncMock,
}));

const opReferencePattern = /\{\{ (op:\/\/[^ }]+) \}\}/g;

function fakeOpCli(secrets: Record<string, string>) {
    const readUris: string[] = [];
    execSyncMock.mockImplementation((command: string, options?: ExecSyncOptions) => {
        if (command === "op --version") {
            return Buffer.from("2.0.0");
        }
        if (command === "op inject") {
            return String(options?.input).replace(opReferencePattern, (_ref, uri: string) => {
                if (!(uri in secrets)) {
                    throw new Error(`[ERROR] could not resolve ${uri}`);
                }
                readUris.push(uri);
                return secrets[uri];
            });
        }
        throw new Error(`Unexpected command: ${command}`);
    });
    return { readUris };
}

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe("resolveOpReferences", () => {
    it("should resolve op:// references", () => {
        fakeOpCli({ "op://vault/item/password": "resolved-secret" });

        const result = resolveOpReferences(['{"key":"{{ op://vault/item/password }}"}']);

        expect(result).toEqual(['{"key":"resolved-secret"}']);
    });

    it("should read each reference once across all inputs", () => {
        const { readUris } = fakeOpCli({
            "op://vault/item/api-key": "resolved-api-key",
            "op://vault/database/password": "resolved-db-password",
        });

        const result = resolveOpReferences([
            '{"apiKey":"{{ op://vault/item/api-key }}","dbPassword":"{{ op://vault/database/password }}"}',
            '{"apiKey":"{{ op://vault/item/api-key }}"}',
        ]);

        expect(result).toEqual(['{"apiKey":"resolved-api-key","dbPassword":"resolved-db-password"}', '{"apiKey":"resolved-api-key"}']);
        expect(readUris.sort()).toEqual(["op://vault/database/password", "op://vault/item/api-key"]);
        expect(execSyncMock.mock.calls.filter(([command]) => command === "op inject")).toHaveLength(1);
    });

    it("should keep multi-line secrets apart", () => {
        fakeOpCli({
            "op://vault/item/private-key": "-----BEGIN KEY-----\nabc\n-----END KEY-----",
            "op://vault/item/password": "resolved-secret",
        });

        const result = resolveOpReferences(['{"key":"{{ op://vault/item/private-key }}","password":"{{ op://vault/item/password }}"}']);

        expect(result).toEqual(['{"key":"-----BEGIN KEY-----\nabc\n-----END KEY-----","password":"resolved-secret"}']);
    });

    it("should throw an error when op inject returns an unexpected number of secrets", () => {
        execSyncMock.mockReturnValue("unexpected output");

        expect(() => resolveOpReferences(['{"apiKey":"{{ op://vault/item/api-key }}","dbPassword":"{{ op://vault/database/password }}"}'])).toThrow(
            "inject-site-configs: Failed to resolve 1Password references: expected 2 secrets, got 1",
        );
    });

    it("should insert secrets containing replacement patterns literally", () => {
        fakeOpCli({ "op://vault/item/password": "a$&b$'c$`d$1" });

        const result = resolveOpReferences(['{"key":"{{ op://vault/item/password }}"}']);

        expect(result).toEqual(['{"key":"a$&b$\'c$`d$1"}']);
    });

    it("should throw an error when op CLI is not installed", () => {
        execSyncMock.mockImplementation(() => {
            throw new Error("command not found: op");
        });

        expect(() => resolveOpReferences(['{"key":"{{ op://vault/item/password }}"}'])).toThrow(
            "inject-site-configs: Config contains 1Password references (op://) but the 1Password CLI (op) is not installed",
        );
    });

    it("should throw an error when op reference resolution fails", () => {
        fakeOpCli({});

        expect(() => resolveOpReferences(['{"key":"{{ op://vault/item/password }}"}'])).toThrow(
            "inject-site-configs: Failed to resolve 1Password references: Error: [ERROR] could not resolve op://vault/item/password",
        );
    });

    it("should not call op CLI when no op:// references are present", () => {
        const result = resolveOpReferences(['{"key":"plain-value"}']);

        expect(result).toEqual(['{"key":"plain-value"}']);
        expect(execSyncMock).not.toHaveBeenCalled();
    });
});

describe("inject-site-configs", () => {
    const siteConfigsModule = `export default () => [
        {
            name: "main",
            domains: { main: "example.com" },
            preloginEnabled: false,
            smtpPassword: "{{ op://vault/smtp/password }}",
            public: { mapsApiKey: "{{ op://vault/maps/api-key }}" },
        },
    ];`;

    async function injectSiteConfigs({ template, args = [] }: { template: string; args?: string[] }) {
        const workingDirectory = fs.mkdtempSync(join(os.tmpdir(), "inject-site-configs-"));
        fs.writeFileSync(join(workingDirectory, "site-configs.mjs"), siteConfigsModule);
        fs.writeFileSync(join(workingDirectory, "template.env"), template);
        vi.spyOn(process, "cwd").mockReturnValue(workingDirectory);
        vi.spyOn(console, "log").mockImplementation(() => undefined);

        // Commander keeps parsed option values on the command instance, so each run needs a fresh one.
        vi.resetModules();
        const { injectSiteConfigsCommand } = await import("./site-configs");
        await injectSiteConfigsCommand.parseAsync(["-i", "template.env", "-o", "out.env", "-f", "site-configs.mjs", ...args], { from: "user" });

        const output = fs.readFileSync(join(workingDirectory, "out.env")).toString();
        fs.rmSync(workingDirectory, { recursive: true });
        return output;
    }

    const secrets = {
        "op://vault/smtp/password": "resolved-smtp-password",
        "op://vault/maps/api-key": "resolved-maps-api-key",
    };

    it("should resolve op:// references of all placeholders with a single op inject call", async () => {
        const { readUris } = fakeOpCli(secrets);

        const output = await injectSiteConfigs({
            template: [
                "PRIVATE={{ site://configs/private/dev }}",
                "PUBLIC={{ site://configs/public/dev }}",
                "PRIVATE_AGAIN={{ site://configs/private/dev }}",
            ].join("\n"),
            args: ["--base64"],
        });

        const [privateSiteConfigs, publicSiteConfigs, privateSiteConfigsAgain] = output
            .split("\n")
            .map((line) => JSON.parse(Buffer.from(line.split("=")[1], "base64").toString()));
        expect(privateSiteConfigs).toEqual([
            {
                name: "main",
                domains: { main: "example.com" },
                url: "https://example.com",
                preloginEnabled: false,
                smtpPassword: "resolved-smtp-password",
                mapsApiKey: "resolved-maps-api-key",
            },
        ]);
        expect(privateSiteConfigsAgain).toEqual(privateSiteConfigs);
        expect(publicSiteConfigs).toEqual([
            {
                name: "main",
                domains: { main: "example.com" },
                url: "https://example.com",
                preloginEnabled: false,
                mapsApiKey: "resolved-maps-api-key",
            },
        ]);
        expect(readUris.sort()).toEqual(["op://vault/maps/api-key", "op://vault/smtp/password"]);
        expect(execSyncMock.mock.calls.filter(([command]) => command === "op inject")).toHaveLength(1);
    });

    it("should inject resolved site configs as single-quoted JSON without --base64", async () => {
        fakeOpCli(secrets);

        const output = await injectSiteConfigs({ template: 'PUBLIC="{{ site://configs/public/dev }}"' });

        expect(output).toBe(
            `PUBLIC='[{"mapsApiKey":"resolved-maps-api-key","name":"main","domains":{"main":"example.com"},"preloginEnabled":false,"url":"https://example.com"}]'`,
        );
    });
});
