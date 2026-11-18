// Prints the workspace projects whose Storybook tests a change can affect, as a JSON array for a job matrix.
// Usage: node .github/scripts/find-storybook-projects.mjs [<base revision>]
// Without a base revision, all projects with a `test:storybook` script are printed.

import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { files: copiedProjectFiles } = require("../../copy-project-files.js");

const filesAffectingAllProjects = [
    /^package\.json$/,
    /^pnpm-lock\.yaml$/,
    /^pnpm-workspace\.yaml$/,
    /^\.nvmrc$/,
    /^tsconfig\.core\.json$/,
    /^copy-project-files\.js$/,
    /^\.github\/actions\/setup\//,
    /^\.github\/scripts\/find-storybook-projects\.mjs$/,
    /^\.github\/workflows\/test\.yml$/,
];

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const baseRevision = process.argv[2];

function git(...args) {
    return execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
}

function listProjectDirectories(filters) {
    const output = execFileSync(
        "pnpm",
        ["--changed-files-ignore-pattern", "**/*.md", ...filters.flatMap((filter) => ["--filter", filter]), "list", "--depth", "-1", "--json"],
        { cwd: repositoryRoot, encoding: "utf8" },
    );
    return JSON.parse(output).map((project) => project.path);
}

function findProjectDirectory(directory) {
    while (!existsSync(path.join(repositoryRoot, directory, "package.json"))) {
        directory = path.dirname(directory);
    }
    return directory;
}

function getFilters() {
    if (!baseRevision) {
        return ["*"];
    }

    const changedFiles = git("diff", "--name-only", baseRevision).split("\n").filter(Boolean);

    if (changedFiles.some((file) => filesAffectingAllProjects.some((pattern) => pattern.test(file)))) {
        return ["*"];
    }

    // Projects that receive a copy of a changed file are affected even though nothing inside them changed.
    const projectsWithChangedCopies = copiedProjectFiles
        .filter(({ file }) => changedFiles.includes(file))
        .flatMap(({ targetDir }) => targetDir.map(findProjectDirectory));

    return [`...[${baseRevision}]`, ...new Set(projectsWithChangedCopies)].map((selector) =>
        selector.startsWith("...") ? selector : `...{${selector}}`,
    );
}

const projects = listProjectDirectories(getFilters())
    .filter((directory) => directory !== repositoryRoot) // The root's `test:storybook` runs the projects' scripts.
    .map((directory) => ({ directory, packageJson: JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8")) }))
    .filter(({ packageJson }) => packageJson.scripts?.["test:storybook"])
    .map(({ directory, packageJson }) => ({
        id: packageJson.name.replace(/^@dextinity\//, ""),
        name: packageJson.name,
        path: path.relative(repositoryRoot, directory),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

const output = JSON.stringify(projects);
console.log(output);

if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `projects=${output}\n`);
}
