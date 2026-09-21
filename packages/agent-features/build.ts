// The skills and rules must stay at the repository root: `install-agent-features` sparse-checks-out `skills/` and `rules/` from there when
// this repository is referenced as an external source. Symlinking them into this package isn't an option because pnpm doesn't follow
// symlinked directories when packing (since v11), so they are copied in instead.
import * as fs from "node:fs";
import * as path from "node:path";

const directories = ["skills", "rules"];

const packageDir = import.meta.dirname;
const repoRoot = path.resolve(packageDir, "../..");
const cleanOnly = process.argv.includes("--clean");

for (const directory of directories) {
    const target = path.join(packageDir, directory);
    fs.rmSync(target, { recursive: true, force: true });

    if (cleanOnly) {
        continue;
    }

    const source = path.join(repoRoot, directory);
    if (!fs.existsSync(source)) {
        throw new Error(`Cannot build @dextinity/agent-features: "${source}" doesn't exist`);
    }

    fs.cpSync(source, target, { recursive: true, dereference: true });

    // Guard against publishing an empty package
    const files = fs.readdirSync(target, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
    if (files.length === 0) {
        throw new Error(`Cannot build @dextinity/agent-features: "${source}" doesn't contain any files`);
    }

    console.log(`Copied ${files.length} files from ${directory}/ in the repository root`); // eslint-disable-line no-console
}
