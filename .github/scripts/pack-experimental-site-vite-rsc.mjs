#!/usr/bin/env node
// Packs the built @dextinity/site-vite-rsc as @vivid/experimental-site-vite-rsc into <out-dir>/package,
// ready for `npm publish <out-dir>/package`. The package must be built beforehand.
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const sourcePackageName = "@dextinity/site-vite-rsc";
const targetPackageName = "@vivid/experimental-site-vite-rsc";
const registry = "https://gitlab.vivid-planet.com/api/v4/projects/899/packages/npm/";

const outDir = process.argv[2];
if (!outDir) {
    console.error("Usage: node .github/scripts/pack-experimental-site-vite-rsc.mjs <out-dir>");
    process.exit(1);
}

const repositoryRoot = resolve(import.meta.dirname, "../..");
const packDir = mkdtempSync(join(tmpdir(), "experimental-site-vite-rsc-"));

// pnpm pack replaces the workspace: ranges with the versions of the workspace packages, npm pack wouldn't
execFileSync("pnpm", ["--filter", sourcePackageName, "pack", "--pack-destination", packDir], { cwd: repositoryRoot, stdio: "inherit" });
const tarball = execFileSync("ls", [packDir], { encoding: "utf8" }).trim();

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
execFileSync("tar", ["-xzf", join(packDir, tarball), "-C", outDir]);
rmSync(packDir, { recursive: true, force: true });

const manifestPath = join(outDir, "package", "package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

for (const dependencies of [manifest.dependencies, manifest.peerDependencies]) {
    for (const [name, range] of Object.entries(dependencies ?? {})) {
        if (range.startsWith("workspace:")) {
            throw new Error(`${name} still has the range ${range} in the packed manifest`);
        }
    }
}

// The timestamp makes later builds sort higher; a single alphanumeric prerelease identifier stays valid semver
// even when the short SHA only consists of digits with a leading zero.
const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
const shortSha = execFileSync("git", ["rev-parse", "--short=7", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" }).trim();
const version = `${manifest.version}-canary-${timestamp}-${shortSha}`;

manifest.name = targetPackageName;
manifest.version = version;
manifest.publishConfig = { "@vivid:registry": registry };
delete manifest.devDependencies;
delete manifest.scripts;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 4)}\n`);

console.log(`Packed ${targetPackageName}@${version} into ${manifestPath}`);
if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
}
