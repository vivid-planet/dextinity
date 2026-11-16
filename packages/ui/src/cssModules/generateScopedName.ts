import { createHash } from "node:crypto";

const componentModulePattern = /src\/components\/[^/]+\/([A-Z][A-Za-z0-9]+)\.module\.scss$/;
const classNamePrefix = "dextinity";

/**
 * Produces the stable class names defined by the class-name contract instead of Vite's default hashed names.
 */
export function generateScopedName(name: string, filename: string): string {
    const componentModuleMatch = filename.match(componentModulePattern);

    if (componentModuleMatch) {
        const componentName = componentModuleMatch[1];

        if (name === "root") {
            return `${classNamePrefix}${componentName}`;
        }

        return `${classNamePrefix}${componentName}__${name}`;
    }

    // No class-name contract for modules outside `src/components` — fall back to a deterministic, file-scoped name.
    return `${name}_${createHash("sha1").update(`${filename}::${name}`).digest("hex").slice(0, 5)}`;
}
