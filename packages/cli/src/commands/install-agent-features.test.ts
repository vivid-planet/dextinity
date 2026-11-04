/* eslint-disable no-console */
import * as fs from "fs";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installFeatures } from "./install-agent-features";

vi.mock("fs");

/**
 * fs mock for installFeatures.
 *
 * - `listings` maps a directory path to the names of its direct entries.
 * - Entries are assumed to be directories unless the entry name ends in `.md`
 *   or appears in `fileContents`.
 * - `existingDests` is the set of destination paths that pathExists/lstatSync
 *   should return truthy for (used to assert overwrite behavior).
 * - `fileContents` provides content for fs.readFileSync; any path not in the
 *   map throws ENOENT.
 */
function mockFilesystem({
    listings = {},
    existingDests = [],
    fileContents = {},
}: {
    listings?: Record<string, string[]>;
    existingDests?: string[];
    fileContents?: Record<string, string>;
} = {}): void {
    const isFile = (p: string): boolean => {
        if (p in fileContents) {
            return true;
        }
        return path.basename(p).endsWith(".md");
    };

    vi.mocked(fs.existsSync).mockImplementation((p) => String(p) in listings);
    vi.mocked(fs.readdirSync as (p: fs.PathLike) => string[]).mockImplementation((p) => listings[String(p)] ?? []);
    vi.mocked(fs.statSync).mockImplementation((p) => {
        const fileLike = isFile(String(p));
        return { isDirectory: () => !fileLike, isFile: () => fileLike } as fs.Stats;
    });
    vi.mocked(fs.lstatSync).mockImplementation((p) => {
        if (existingDests.includes(String(p))) {
            return {} as fs.Stats;
        }
        throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    });
    vi.mocked(fs.readFileSync as (p: fs.PathLike | number, options: BufferEncoding) => string).mockImplementation((p) => {
        const content = fileContents[String(p)];
        if (content !== undefined) {
            return content;
        }
        throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    });
}

beforeEach(() => {
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    vi.mocked(fs.symlinkSync).mockImplementation(() => undefined);
    vi.mocked(fs.cpSync).mockImplementation(() => undefined);
    vi.mocked(fs.rmSync).mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe("installFeatures – local skills", () => {
    it("symlinks skill folders into .agents/skills and .claude/skills", () => {
        mockFilesystem({ listings: { "/proj/skills": ["my-skill"] } });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/skills/my-skill"), path.join("/proj", ".agents", "skills", "my-skill"));
        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/skills/my-skill"), path.join("/proj", ".claude", "skills", "my-skill"));
    });

    it("also installs from agentic-plugin/skills/", () => {
        mockFilesystem({ listings: { "/proj/agentic-plugin/skills": ["plugin-skill"] } });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(
            path.resolve("/proj/agentic-plugin/skills/plugin-skill"),
            path.join("/proj", ".claude", "skills", "plugin-skill"),
        );
    });

    it("skills/ takes priority over agentic-plugin/skills/ for same name", () => {
        mockFilesystem({
            listings: {
                "/proj/skills": ["shared"],
                "/proj/agentic-plugin/skills": ["shared"],
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/skills/shared"), expect.any(String));
        expect(fs.symlinkSync).not.toHaveBeenCalledWith(path.resolve("/proj/agentic-plugin/skills/shared"), expect.any(String));
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('CONFLICT: "shared"'));
    });

    it("ignores files in skills/ — only subdirectories are skills", () => {
        mockFilesystem({ listings: { "/proj/skills": ["real-skill", "not-a-skill.md"] } });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/skills/real-skill"), expect.any(String));
        expect(fs.symlinkSync).not.toHaveBeenCalledWith(path.resolve("/proj/skills/not-a-skill.md"), expect.any(String));
    });
});

describe("installFeatures – local rules", () => {
    it("symlinks .md files into .agents/rules, .claude/rules, .cursor/rules, and .github/instructions", () => {
        mockFilesystem({ listings: { "/proj/rules": ["my-rule.md"] } });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.mkdirSync).toHaveBeenCalledWith(path.join("/proj", ".agents", "rules"), { recursive: true });
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.join("/proj", ".claude", "rules"), { recursive: true });
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.join("/proj", ".cursor", "rules"), { recursive: true });
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.join("/proj", ".github", "instructions"), { recursive: true });

        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/rules/my-rule.md"), path.join("/proj", ".agents", "rules", "my-rule.md"));
        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/rules/my-rule.md"), path.join("/proj", ".claude", "rules", "my-rule.md"));
        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/rules/my-rule.md"), path.join("/proj", ".cursor", "rules", "my-rule.md"));
        expect(fs.symlinkSync).toHaveBeenCalledWith(
            path.resolve("/proj/rules/my-rule.md"),
            path.join("/proj", ".github", "instructions", "my-rule.md"),
        );
    });

    it("walks subdirectories recursively, preserving the layout in each target", () => {
        mockFilesystem({
            listings: {
                "/proj/rules": ["top.md", "backend"],
                "/proj/rules/backend": ["api.md", "deeper"],
                "/proj/rules/backend/deeper": ["nested.md"],
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(
            path.resolve("/proj/rules/backend/api.md"),
            path.join("/proj", ".claude", "rules", "backend", "api.md"),
        );
        expect(fs.symlinkSync).toHaveBeenCalledWith(
            path.resolve("/proj/rules/backend/deeper/nested.md"),
            path.join("/proj", ".claude", "rules", "backend", "deeper", "nested.md"),
        );
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.join("/proj", ".claude", "rules", "backend"), { recursive: true });
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.join("/proj", ".claude", "rules", "backend", "deeper"), { recursive: true });
    });

    it("ignores non-.md entries", () => {
        mockFilesystem({ listings: { "/proj/rules": ["rule.md", "README.txt"] } });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/rules/rule.md"), expect.any(String));
        expect(fs.symlinkSync).not.toHaveBeenCalledWith(path.resolve("/proj/rules/README.txt"), expect.any(String));
    });
});

describe("installFeatures – cross-namespace", () => {
    it("a skill and a rule may share a name without conflicting", () => {
        mockFilesystem({
            listings: {
                "/proj/skills": ["shared"],
                "/proj/rules": ["shared.md"],
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(console.warn).not.toHaveBeenCalled();
        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/skills/shared"), expect.any(String));
        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/rules/shared.md"), expect.any(String));
    });
});

describe("installFeatures – dry-run", () => {
    it("writes nothing", () => {
        mockFilesystem({
            listings: {
                "/proj/skills": ["my-skill"],
                "/proj/rules": ["my-rule.md"],
            },
        });

        installFeatures("/proj", [], { dryRun: true });

        expect(fs.symlinkSync).not.toHaveBeenCalled();
        expect(fs.cpSync).not.toHaveBeenCalled();
        expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it("logs would-be operations", () => {
        mockFilesystem({ listings: { "/proj/skills": ["my-skill"] } });

        installFeatures("/proj", [], { dryRun: true });

        expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`[dry-run] Would symlink: ${path.resolve("/proj/skills/my-skill")}`));
    });
});

describe("installFeatures – overwrites existing destinations", () => {
    it("removes the existing destination before re-creating it", () => {
        mockFilesystem({
            listings: { "/proj/skills": ["my-skill"] },
            existingDests: [path.join("/proj", ".agents", "skills", "my-skill"), path.join("/proj", ".claude", "skills", "my-skill")],
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.rmSync).toHaveBeenCalledWith(path.join("/proj", ".agents", "skills", "my-skill"), { recursive: true, force: true });
        expect(fs.rmSync).toHaveBeenCalledWith(path.join("/proj", ".claude", "skills", "my-skill"), { recursive: true, force: true });
    });
});

describe("installFeatures – internal filtering", () => {
    it("local sources install internal skills (filterInternal applies only to external repos)", () => {
        mockFilesystem({
            listings: { "/proj/skills": ["public", "internal"] },
            fileContents: { "/proj/skills/internal/SKILL.md": "---\nmetadata:\n  internal: true\n---\n# Internal" },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/skills/public"), expect.any(String));
        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/skills/internal"), expect.any(String));
    });
});

describe("installFeatures – node_modules skills and rules", () => {
    it("symlinks skills from node_modules packages", () => {
        mockFilesystem({
            listings: {
                "/proj/node_modules": ["some-tool"],
                "/proj/node_modules/some-tool": ["skills", "package.json"],
                "/proj/node_modules/some-tool/skills": ["tool-docs"],
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(
            path.resolve("/proj/node_modules/some-tool/skills/tool-docs"),
            path.join("/proj", ".agents", "skills", "tool-docs"),
        );
        expect(fs.symlinkSync).toHaveBeenCalledWith(
            path.resolve("/proj/node_modules/some-tool/skills/tool-docs"),
            path.join("/proj", ".claude", "skills", "tool-docs"),
        );
    });

    it("symlinks rules from node_modules packages", () => {
        mockFilesystem({
            listings: {
                "/proj/node_modules": ["some-tool"],
                "/proj/node_modules/some-tool": ["rules", "package.json"],
                "/proj/node_modules/some-tool/rules": ["best-practices.md"],
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(
            path.resolve("/proj/node_modules/some-tool/rules/best-practices.md"),
            path.join("/proj", ".agents", "rules", "best-practices.md"),
        );
        expect(fs.symlinkSync).toHaveBeenCalledWith(
            path.resolve("/proj/node_modules/some-tool/rules/best-practices.md"),
            path.join("/proj", ".claude", "rules", "best-practices.md"),
        );
    });

    it("discovers skills from @scoped packages", () => {
        mockFilesystem({
            listings: {
                "/proj/node_modules": ["@my-scope"],
                "/proj/node_modules/@my-scope": ["my-tool"],
                "/proj/node_modules/@my-scope/my-tool": ["skills", "package.json"],
                "/proj/node_modules/@my-scope/my-tool/skills": ["scoped-skill"],
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(
            path.resolve("/proj/node_modules/@my-scope/my-tool/skills/scoped-skill"),
            path.join("/proj", ".agents", "skills", "scoped-skill"),
        );
    });

    it("local skills take priority over node_modules skills", () => {
        mockFilesystem({
            listings: {
                "/proj/skills": ["shared"],
                "/proj/node_modules": ["some-tool"],
                "/proj/node_modules/some-tool": ["skills", "package.json"],
                "/proj/node_modules/some-tool/skills": ["shared"],
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/skills/shared"), expect.any(String));
        expect(fs.symlinkSync).not.toHaveBeenCalledWith(path.resolve("/proj/node_modules/some-tool/skills/shared"), expect.any(String));
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('CONFLICT: "shared"'));
    });

    it("filters internal skills from node_modules", () => {
        mockFilesystem({
            listings: {
                "/proj/node_modules": ["some-tool"],
                "/proj/node_modules/some-tool": ["skills", "package.json"],
                "/proj/node_modules/some-tool/skills": ["public-skill", "internal-skill"],
            },
            fileContents: {
                "/proj/node_modules/some-tool/skills/internal-skill/SKILL.md": "---\nmetadata:\n  internal: true\n---\n# Internal",
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/node_modules/some-tool/skills/public-skill"), expect.any(String));
        expect(fs.symlinkSync).not.toHaveBeenCalledWith(path.resolve("/proj/node_modules/some-tool/skills/internal-skill"), expect.any(String));
    });

    it("skips dotfiles and dotfolders in node_modules", () => {
        mockFilesystem({
            listings: {
                "/proj/node_modules": [".bin", ".package-lock.json", "some-tool"],
                "/proj/node_modules/some-tool": ["skills", "package.json"],
                "/proj/node_modules/some-tool/skills": ["my-skill"],
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).toHaveBeenCalledWith(path.resolve("/proj/node_modules/some-tool/skills/my-skill"), expect.any(String));
    });

    it("does not add a source entry for packages without a skills/ or rules/ directory", () => {
        mockFilesystem({
            listings: {
                "/proj/node_modules": ["no-skills-tool"],
                "/proj/node_modules/no-skills-tool": ["dist", "package.json"],
                // no skills/ or rules/ entry
            },
        });

        installFeatures("/proj", [], { dryRun: false });

        // No symlinks and no "No skills found in node_modules" log noise
        expect(fs.symlinkSync).not.toHaveBeenCalled();
        expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining("node_modules no-skills-tool"));
    });
});

describe("installFeatures – missing local sources", () => {
    it("runs cleanly when there are no local skills or rules", () => {
        mockFilesystem({});

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.symlinkSync).not.toHaveBeenCalled();
        expect(fs.cpSync).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("No skills found"));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("No rules found"));
    });
});

describe("installFeatures – EPERM symlink fallback", () => {
    it("falls back to copy when symlinkSync throws EPERM (e.g. Windows without privileges)", () => {
        mockFilesystem({ listings: { "/proj/skills": ["my-skill"] } });
        vi.mocked(fs.symlinkSync).mockImplementationOnce(() => {
            throw Object.assign(new Error("permission denied"), { code: "EPERM" });
        });

        installFeatures("/proj", [], { dryRun: false });

        expect(fs.cpSync).toHaveBeenCalledWith(path.resolve("/proj/skills/my-skill"), path.join("/proj", ".agents", "skills", "my-skill"), {
            recursive: true,
        });
    });
});
