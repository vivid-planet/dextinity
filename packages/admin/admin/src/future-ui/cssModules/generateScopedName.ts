import { createHash } from "node:crypto";

const futureUiModulePattern = /future-ui\/components\/[^/]+\/([A-Z][A-Za-z0-9]+)\.module\.scss$/;
const futureUiClassnamePrefix = "dextinity";

/**
 * Produces the stable class names defined by the Future UI class-name contract instead of Vite's default hashed names.
 */
export function generateScopedName(name: string, filename: string): string {
    const futureUiMatch = filename.match(futureUiModulePattern);

    if (futureUiMatch) {
        const componentName = futureUiMatch[1];

        if (name === "root") {
            return `${futureUiClassnamePrefix}${componentName}`;
        }

        return `${futureUiClassnamePrefix}${componentName}__${name}`;
    }

    // No class-name contract for modules outside future-ui — fall back to a deterministic, file-scoped name.
    return `${name}_${createHash("sha1").update(`${filename}::${name}`).digest("hex").slice(0, 5)}`;
}
