/* eslint-disable no-console */
import { execFileSync } from "child_process";
import { Command } from "commander";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as os from "os";
import * as path from "path";

const SKILL_SOURCE_PATHS = ["skills", "agentic-plugin/skills"];
const RULE_SOURCE_PATHS = ["rules"];

interface InstallOptions {
    dryRun: boolean;
}

interface InstallSource {
    label: string;
    directory: string;
    /** `folders` treats each subdirectory as one item; `files` walks the tree and treats each *.md file as one item */
    discover: "folders" | "files";
    /** If true, create symlinks; if false, copy */
    symlink: boolean;
    /** If true, exclude items with `metadata.internal: true` in their frontmatter */
    filterInternal?: boolean;
    /** Tracks names already installed from higher-priority sources within this namespace */
    installed: Set<string>;
    /** Label shown in the "No X found" / "Installing N X" log lines */
    itemLabelSingular: string;
    itemLabelPlural: string;
}

function discoverNodeModulesPackages(cwd: string): string[] {
    const nodeModulesDir = path.join(cwd, "node_modules");
    if (!fs.existsSync(nodeModulesDir)) {
        return [];
    }

    const packageDirs: string[] = [];
    let entries: string[];
    try {
        entries = fs.readdirSync(nodeModulesDir);
    } catch {
        return [];
    }

    for (const entry of entries) {
        if (entry.startsWith(".")) {
            continue;
        }
        const fullPath = path.join(nodeModulesDir, entry);
        if (entry.startsWith("@")) {
            // Scoped package: read one level deeper
            let scopedEntries: string[];
            try {
                scopedEntries = fs.readdirSync(fullPath);
            } catch {
                continue;
            }
            for (const scopedEntry of scopedEntries) {
                if (scopedEntry.startsWith(".")) {
                    continue;
                }
                const scopedPath = path.join(fullPath, scopedEntry);
                try {
                    if (fs.statSync(scopedPath).isDirectory()) {
                        packageDirs.push(scopedPath);
                    }
                } catch {
                    // skip unreadable entries
                }
            }
        } else {
            try {
                if (fs.statSync(fullPath).isDirectory()) {
                    packageDirs.push(fullPath);
                }
            } catch {
                // skip unreadable entries
            }
        }
    }

    return packageDirs;
}

function parseRepoUrl(rawUrl: string): { repoUrl: string; ref: string | undefined } {
    const hashIndex = rawUrl.lastIndexOf("#");
    if (hashIndex === -1) {
        return { repoUrl: rawUrl, ref: undefined };
    }
    return { repoUrl: rawUrl.slice(0, hashIndex), ref: rawUrl.slice(hashIndex + 1) || undefined };
}

function cloneRepo(rawUrl: string, sparsePatterns: string[]): string {
    const { repoUrl, ref } = parseRepoUrl(rawUrl);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dextinity-agent-install-"));

    execFileSync("git", ["init", tmpDir], { stdio: "pipe" });
    execFileSync("git", ["-C", tmpDir, "remote", "add", "origin", "--", repoUrl], { stdio: "pipe" });
    execFileSync("git", ["-C", tmpDir, "config", "core.sparseCheckout", "true"], { stdio: "pipe" });
    fs.writeFileSync(path.join(tmpDir, ".git", "info", "sparse-checkout"), sparsePatterns.map((p) => `${p}\n`).join(""));

    const fetchRef = ref ?? "HEAD";
    try {
        console.log(`Fetching ${repoUrl} ref "${fetchRef}" (sparse: ${sparsePatterns.join(", ")})...`);
        execFileSync("git", ["-C", tmpDir, "fetch", "--depth", "1", "origin", fetchRef], { stdio: "pipe" });
        execFileSync("git", ["-C", tmpDir, "checkout", "FETCH_HEAD"], { stdio: "pipe" });
    } catch {
        console.log(`Shallow fetch failed for ref "${fetchRef}"; falling back to full fetch...`);
        execFileSync("git", ["-C", tmpDir, "fetch", "origin", fetchRef], { stdio: "pipe" });
        execFileSync("git", ["-C", tmpDir, "checkout", "FETCH_HEAD"], { stdio: "pipe" });
    }

    return tmpDir;
}

function pathExists(p: string): boolean {
    try {
        fs.lstatSync(p);
        return true;
    } catch {
        return false;
    }
}

interface MarkdownFrontmatter {
    metadata?: {
        internal?: boolean;
    };
}

function isInternalMarkdown(mdPath: string): boolean {
    let content: string;
    try {
        content = fs.readFileSync(mdPath, "utf-8");
    } catch {
        return false;
    }
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
        return false;
    }
    try {
        const parsed = yaml.load(match[1]) as MarkdownFrontmatter | undefined;
        return parsed?.metadata?.internal === true;
    } catch {
        return false;
    }
}

function listFolders(directory: string, filterInternal: boolean): string[] {
    return fs
        .readdirSync(directory)
        .filter((entry) => fs.statSync(path.join(directory, entry)).isDirectory())
        .filter((folder) => !filterInternal || !isInternalMarkdown(path.join(directory, folder, "SKILL.md")))
        .sort();
}

function listMarkdownFiles(directory: string, filterInternal: boolean): string[] {
    const results: string[] = [];
    const walk = (currentDir: string, relativePath: string): void => {
        for (const entry of fs.readdirSync(currentDir)) {
            const fullPath = path.join(currentDir, entry);
            const relPath = relativePath ? path.join(relativePath, entry) : entry;
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                walk(fullPath, relPath);
            } else if (stat.isFile() && entry.endsWith(".md")) {
                if (!filterInternal || !isInternalMarkdown(fullPath)) {
                    results.push(relPath);
                }
            }
        }
    };
    walk(directory, "");
    return results.sort();
}

function symlinkOrCopy(src: string, dest: string, symlink: boolean): "symlinked" | "copied" {
    if (symlink) {
        try {
            fs.symlinkSync(src, dest);
            return "symlinked";
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== "EPERM") {
                throw err;
            }
            // Windows without symlink privilege — fall back to copy
        }
    }
    fs.cpSync(src, dest, { recursive: true });
    return "copied";
}

function installItems(sources: InstallSource[], targetDirs: string[], { dryRun }: InstallOptions): number {
    let totalInstalled = 0;

    for (const source of sources) {
        const { label, directory, discover, symlink, filterInternal, installed, itemLabelSingular, itemLabelPlural } = source;
        if (!fs.existsSync(directory)) {
            console.log(`No ${itemLabelPlural} found in ${label}`);
            continue;
        }
        const items =
            discover === "folders" ? listFolders(directory, filterInternal ?? false) : listMarkdownFiles(directory, filterInternal ?? false);
        if (items.length === 0) {
            console.log(`No ${itemLabelPlural} found in ${label}`);
            continue;
        }
        console.log(`Installing ${items.length} ${items.length === 1 ? itemLabelSingular : itemLabelPlural} from ${label}...`);
        for (const item of items) {
            if (installed.has(item)) {
                console.warn(`  CONFLICT: "${item}" from ${label} skipped (already installed from a higher-priority source)`);
                continue;
            }
            const srcPath = path.resolve(path.join(directory, item));
            for (const targetDir of targetDirs) {
                const destPath = path.join(targetDir, item);
                if (dryRun) {
                    console.log(`  [dry-run] Would ${symlink ? "symlink" : "copy"}: ${srcPath} -> ${destPath}`);
                } else {
                    if (pathExists(destPath)) {
                        fs.rmSync(destPath, { recursive: true, force: true });
                    }
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                    const action = symlinkOrCopy(srcPath, destPath, symlink);
                    console.log(`  ${action === "symlinked" ? "Symlinked" : "Copied"}: ${item}`);
                }
            }
            installed.add(item);
            totalInstalled++;
        }
    }

    return totalInstalled;
}

interface AgentFeaturesConfig {
    repos?: string[];
}

function loadConfig(configPath: string): AgentFeaturesConfig {
    const resolved = path.resolve(configPath);
    if (!fs.existsSync(resolved)) {
        throw new Error(`Config file not found: ${resolved}`);
    }
    const raw = fs.readFileSync(resolved, "utf-8");
    return JSON.parse(raw) as AgentFeaturesConfig;
}

export function installFeatures(cwd: string, repos: string[], options: InstallOptions): void {
    const skillsTargetDirs = [path.join(cwd, ".agents", "skills"), path.join(cwd, ".claude", "skills")];
    const rulesTargetDirs = [
        path.join(cwd, ".agents", "rules"),
        path.join(cwd, ".claude", "rules"),
        path.join(cwd, ".cursor", "rules"),
        path.join(cwd, ".github", "instructions"),
    ];

    for (const dir of [...skillsTargetDirs, ...rulesTargetDirs]) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const installedSkills = new Set<string>();
    const installedRules = new Set<string>();

    const skillSources: InstallSource[] = SKILL_SOURCE_PATHS.map((p) => ({
        label: `local ${p}/`,
        directory: path.join(cwd, p),
        discover: "folders",
        symlink: true,
        installed: installedSkills,
        itemLabelSingular: "skill",
        itemLabelPlural: "skills",
    }));
    const ruleSources: InstallSource[] = RULE_SOURCE_PATHS.map((p) => ({
        label: `local ${p}/`,
        directory: path.join(cwd, p),
        discover: "files",
        symlink: true,
        installed: installedRules,
        itemLabelSingular: "rule",
        itemLabelPlural: "rules",
    }));

    // Discover skills/rules from node_modules (direct dependencies only, including @scoped packages)
    const nodeModulesPackages = discoverNodeModulesPackages(cwd);
    for (const pkgDir of nodeModulesPackages) {
        const pkgName = pkgDir.includes(`${path.sep}@`) ? pkgDir.split(path.sep).slice(-2).join("/") : path.basename(pkgDir);
        for (const p of SKILL_SOURCE_PATHS) {
            const dir = path.join(pkgDir, p);
            if (fs.existsSync(dir)) {
                skillSources.push({
                    label: `node_modules ${pkgName} (${p}/)`,
                    directory: dir,
                    discover: "folders",
                    symlink: true,
                    filterInternal: true,
                    installed: installedSkills,
                    itemLabelSingular: "skill",
                    itemLabelPlural: "skills",
                });
            }
        }
        for (const p of RULE_SOURCE_PATHS) {
            const dir = path.join(pkgDir, p);
            if (fs.existsSync(dir)) {
                ruleSources.push({
                    label: `node_modules ${pkgName} (${p}/)`,
                    directory: dir,
                    discover: "files",
                    symlink: true,
                    filterInternal: true,
                    installed: installedRules,
                    itemLabelSingular: "rule",
                    itemLabelPlural: "rules",
                });
            }
        }
    }

    const sparsePatterns = [...SKILL_SOURCE_PATHS, ...RULE_SOURCE_PATHS].map((p) => `${p}/`);

    const tempDirs: string[] = [];
    try {
        for (const rawUrl of repos) {
            const cloneDir = cloneRepo(rawUrl, sparsePatterns);
            tempDirs.push(cloneDir);
            for (const p of SKILL_SOURCE_PATHS) {
                skillSources.push({
                    label: `external ${rawUrl} (${p}/)`,
                    directory: path.join(cloneDir, p),
                    discover: "folders",
                    symlink: false,
                    filterInternal: true,
                    installed: installedSkills,
                    itemLabelSingular: "skill",
                    itemLabelPlural: "skills",
                });
            }
            for (const p of RULE_SOURCE_PATHS) {
                ruleSources.push({
                    label: `external ${rawUrl} (${p}/)`,
                    directory: path.join(cloneDir, p),
                    discover: "files",
                    symlink: false,
                    filterInternal: true,
                    installed: installedRules,
                    itemLabelSingular: "rule",
                    itemLabelPlural: "rules",
                });
            }
        }
        const skillCount = installItems(skillSources, skillsTargetDirs, options);
        const ruleCount = installItems(ruleSources, rulesTargetDirs, options);
        console.log(`\nTotal skills installed: ${skillCount}`);
        console.log(`Total rules installed: ${ruleCount}`);
    } finally {
        for (const tmpDir of tempDirs) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    }
}

export const installAgentFeaturesCommand = new Command("install-agent-features")
    .description("Install agent features (skills and rules) from local directories and optional external git repos")
    .option("--config <path>", "Path to a JSON config file specifying repos to install features from", "agent-features.json")
    .option("--dry-run", "Show which symlinks/copies would be created without making changes", false)
    .action(async (options: { config: string; dryRun: boolean }) => {
        const { config: configPath, dryRun } = options;

        const resolvedConfig = path.resolve(configPath);
        const repos = fs.existsSync(resolvedConfig) ? (loadConfig(configPath).repos ?? []) : [];
        console.log(`=== Installing agent features${dryRun ? " (dry run)" : ""} ===`);

        installFeatures(process.cwd(), repos, { dryRun });

        console.log("=== Finished ===");
    });
