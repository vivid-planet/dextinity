/**
 * Accepts a number, or a string in `16x9`, `16/9` or `16:9` notation. A string without a second value is read as a
 * ratio to 1, so `2` and `2x1` are the same.
 *
 * Duplicate of `parseAspectRatio` in `@dextinity/site-react`, which `@dextinity/cms-admin` must not depend on. Keep
 * both accepting the same formats, so a project can write a ratio identically in the admin and in the site.
 */
export function parseAspectRatio(value: string | number): number {
    let width: number | undefined;
    let height: number | undefined;

    if (typeof value === "string") {
        [width, height] = value.split(/[x/:]/).map((part) => {
            const parsed = parseFloat(part);
            return isNaN(parsed) ? undefined : parsed;
        });

        if (width && !height) {
            height = 1;
        }
    } else {
        width = value;
        height = 1;
    }

    if (!width || !height) {
        throw new Error(`An error occurred while parsing the aspect ratio: ${value}`);
    }

    return width / height;
}

/**
 * Renders an aspect ratio as `16:9` for display, whichever notation it was written in.
 */
export function formatAspectRatio(value: string | number): string {
    if (typeof value === "string") {
        const [width, height = "1"] = value.split(/[x/:]/);
        return `${width}:${height}`;
    }

    return `${Math.round(value * 100) / 100}:1`;
}
