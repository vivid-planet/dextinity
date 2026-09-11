import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const directoryOfThisFile = dirname(fileURLToPath(import.meta.url));

export function managerEntries(existing: string[] = []) {
    return [...existing, resolve(directoryOfThisFile, "manager.js")];
}

type PreviewAnnotationsOptions = {
    /**
     * Set this when this Storybook's own stories must not be rendered as emails.
     * The addon UI stays registered and appears on mail stories from a composed Storybook.
     */
    disablePreviewAnnotations?: boolean;
};

export function previewAnnotations(input: string[] = [], { disablePreviewAnnotations }: PreviewAnnotationsOptions = {}) {
    return disablePreviewAnnotations ? input : [...input, resolve(directoryOfThisFile, "preview.js")];
}
