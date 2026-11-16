import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const publishedPackages = JSON.parse(process.env.PUBLISHED_PACKAGES);
const version = process.env.PUBLISHED_VERSION;
const tagName = `v${version}`;

function getChangelogEntry(changelog, version) {
    const lines = changelog.split("\n");
    const start = lines.findIndex((line) => line.trim() === `## ${version}`);
    if (start === -1) {
        return "";
    }

    const entry = [];
    let isInCodeBlock = false;
    for (const line of lines.slice(start + 1)) {
        if (line.trimStart().startsWith("```")) {
            isInCodeBlock = !isInCodeBlock;
        }
        if (!isInCodeBlock && line.startsWith("## ")) {
            break;
        }
        entry.push(line);
    }
    return entry.join("\n").trim();
}

const workspacePackages = JSON.parse(execFileSync("pnpm", ["list", "--recursive", "--depth", "-1", "--json"], { encoding: "utf-8" }));
const packagePaths = new Map(workspacePackages.map((pkg) => [pkg.name, pkg.path]));

const releaseNotes = publishedPackages
    .map(({ name, version }) => {
        const packagePath = packagePaths.get(name);
        if (packagePath === undefined) {
            throw new Error(`Package ${name} not found in workspace`);
        }
        const changelog = readFileSync(join(packagePath, "CHANGELOG.md"), "utf-8");
        return `## ${name}@${version}\n\n${getChangelogEntry(changelog, version)}\n`;
    })
    .join("\n");

const notesFile = join(process.env.RUNNER_TEMP ?? tmpdir(), "release-notes.md");
writeFileSync(notesFile, releaseNotes);

const isReleaseExisting = spawnSync("gh", ["release", "view", tagName], { stdio: "ignore" }).status === 0;

if (isReleaseExisting) {
    console.log(`Release ${tagName} already exists`);
} else {
    execFileSync(
        "gh",
        [
            "release",
            "create",
            tagName,
            "--title",
            version,
            "--notes-file",
            notesFile,
            "--target",
            process.env.GITHUB_SHA,
            ...(version.includes("-") ? ["--prerelease"] : []),
        ],
        { stdio: "inherit" },
    );
}
