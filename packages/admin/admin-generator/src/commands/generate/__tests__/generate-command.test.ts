import type { CommanderError } from "commander";
import { glob } from "glob";
import { buildSchema } from "graphql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateCommand } from "../generate-command";

vi.mock("glob", () => ({ glob: vi.fn(async () => []) }));
vi.mock("@graphql-tools/load", () => ({ loadSchema: vi.fn(async () => buildSchema("type Query { id: ID }")) }));

describe("generate command", () => {
    beforeEach(() => {
        vi.mocked(glob).mockClear();
        vi.spyOn(console, "log").mockImplementation(() => {});
        generateCommand.exitOverride().configureOutput({ writeErr: () => {} });
    });

    it("passes a quoted glob to glob unchanged", async () => {
        await generateCommand.parseAsync(["--file", "src/**/*.dextinityGen.tsx"], { from: "user" });

        expect(glob).toHaveBeenCalledWith("src/**/*.dextinityGen.tsx");
    });

    it("fails without generating when an unquoted glob expands into several files", async () => {
        await expect(generateCommand.parseAsync(["--file", "src/a.dextinityGen.tsx", "src/b.dextinityGen.tsx"], { from: "user" })).rejects.toThrow(
            expect.objectContaining<Partial<CommanderError>>({ code: "commander.excessArguments" }),
        );

        expect(glob).not.toHaveBeenCalled();
    });
});
