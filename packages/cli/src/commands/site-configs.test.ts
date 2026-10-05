import { execSync } from "child_process";
import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveOpReferences } from "./site-configs";

vi.mock("child_process", () => ({
    execSync: vi.fn(),
}));

const mockedExecSync = vi.mocked(execSync);

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe("resolveOpReferences", () => {
    it("should resolve op:// references", () => {
        mockedExecSync.mockImplementation((cmd: string) => {
            if (cmd === "op --version") {
                return Buffer.from("2.0.0");
            }
            if (cmd === 'op read "op://vault/item/password"') {
                return "resolved-secret\n";
            }
            return "";
        });

        const result = resolveOpReferences('{"key":"{{ op://vault/item/password }}"}');

        expect(result).toBe('{"key":"resolved-secret"}');
    });

    it("should throw an error when op CLI is not installed", () => {
        mockedExecSync.mockImplementation(() => {
            throw new Error("command not found: op");
        });

        expect(() => resolveOpReferences('{"key":"{{ op://vault/item/password }}"}')).toThrow(
            "inject-site-configs: Config contains 1Password references (op://) but the 1Password CLI (op) is not installed",
        );
    });

    it("should throw an error when op reference resolution fails", () => {
        mockedExecSync.mockImplementation((cmd: string) => {
            if (cmd === "op --version") {
                return Buffer.from("2.0.0");
            }
            if (cmd === 'op read "op://vault/item/password"') {
                throw new Error("Item not found");
            }
            return "";
        });

        expect(() => resolveOpReferences('{"key":"{{ op://vault/item/password }}"}')).toThrow(
            "inject-site-configs: Failed to resolve 1Password reference {{ op://vault/item/password }}",
        );
    });

    it("should resolve multiple op:// references", () => {
        mockedExecSync.mockImplementation((cmd: string) => {
            if (cmd === "op --version") {
                return Buffer.from("2.0.0");
            }
            if (cmd === 'op read "op://vault/item/api-key"') {
                return "resolved-api-key\n";
            }
            if (cmd === 'op read "op://vault/item/api-secret"') {
                return "resolved-api-secret\n";
            }
            if (cmd === 'op read "op://vault/database/password"') {
                return "resolved-db-password\n";
            }
            return "";
        });

        const result = resolveOpReferences(
            '{"apiKey":"{{ op://vault/item/api-key }}","apiSecret":"{{ op://vault/item/api-secret }}","dbPassword":"{{ op://vault/database/password }}"}',
        );

        expect(result).toBe('{"apiKey":"resolved-api-key","apiSecret":"resolved-api-secret","dbPassword":"resolved-db-password"}');
    });

    it("should insert secrets containing replacement patterns literally", () => {
        mockedExecSync.mockImplementation((cmd: string) => {
            if (cmd === "op --version") {
                return Buffer.from("2.0.0");
            }
            if (cmd === 'op read "op://vault/item/password"') {
                return "a$&b$'c$`d$1\n";
            }
            return "";
        });

        const result = resolveOpReferences('{"key":"{{ op://vault/item/password }}"}');

        expect(result).toBe('{"key":"a$&b$\'c$`d$1"}');
    });

    it("should not call op CLI when no op:// references are present", () => {
        const result = resolveOpReferences('{"key":"plain-value"}');

        expect(result).toBe('{"key":"plain-value"}');
        expect(mockedExecSync).not.toHaveBeenCalled();
    });
});
