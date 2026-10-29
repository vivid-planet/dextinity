import { readdirSync, readFileSync } from "node:fs";
import { isBuiltin } from "node:module";
import { join } from "node:path";

import { parseAst } from "rollup/parseAst";
import { describe, expect, it } from "vitest";

type PackageJson = { dependencies: Record<string, string>; peerDependencies?: Record<string, string> };

const packageRoot = join(import.meta.dirname, "..");
const libDir = join(packageRoot, "lib");

function readPackageJson(path: string): PackageJson {
    return JSON.parse(readFileSync(path, "utf-8"));
}

function getImportSources(node: unknown): string[] {
    if (Array.isArray(node)) {
        return node.flatMap(getImportSources);
    }
    if (typeof node !== "object" || node === null) {
        return [];
    }
    const sources = Object.values(node).flatMap(getImportSources);
    const { source } = node as { source?: { type?: string; value?: unknown } };
    if (source?.type === "Literal" && typeof source.value === "string") {
        sources.push(source.value);
    }
    return sources;
}

function getPackageName(importSource: string) {
    const segments = importSource.split("/");
    return importSource.startsWith("@") ? segments.slice(0, 2).join("/") : segments[0];
}

function getImportedPackages() {
    const jsFiles = readdirSync(libDir, { recursive: true, encoding: "utf-8" }).filter((file) => file.endsWith(".js"));
    if (jsFiles.length === 0) {
        throw new Error("No build output found in lib/. Run `pnpm run build` first.");
    }
    const importSources = jsFiles.flatMap((file) => getImportSources(parseAst(readFileSync(join(libDir, file), "utf-8"))));
    const packageNames = importSources.filter((source) => !source.startsWith(".") && !isBuiltin(source)).map(getPackageName);
    return [...new Set(packageNames)].sort();
}

// @dextinity/site-react is compiled into lib/ (see vite.config.mts), so its npm imports must be declared here as well
describe("build output dependencies", () => {
    const packageJson = readPackageJson(join(packageRoot, "package.json"));
    const siteReactPackageJson = readPackageJson(join(packageRoot, "../site-react/package.json"));
    const importedPackages = getImportedPackages();

    it("declares every imported package as dependency or peer dependency", () => {
        const declaredPackages = { ...packageJson.dependencies, ...packageJson.peerDependencies };
        expect(importedPackages.filter((name) => !(name in declaredPackages))).toEqual([]);
    });

    it("uses the same ranges as @dextinity/site-react", () => {
        const sharedPackages = importedPackages.filter((name) => name in siteReactPackageJson.dependencies);
        const ranges = (dependencies: Record<string, string>) => Object.fromEntries(sharedPackages.map((name) => [name, dependencies[name]]));
        expect(ranges(packageJson.dependencies)).toEqual(ranges(siteReactPackageJson.dependencies));
    });
});
