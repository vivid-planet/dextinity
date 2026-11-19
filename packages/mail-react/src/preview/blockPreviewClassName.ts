// MJML strips `data-` attributes from `mj-` tags, so the route reaches the compiled mail as a class.
const ROUTE_CLASS_PREFIX = "dextinity-preview-route:";
const LABEL_CLASS_PREFIX = "dextinity-preview-label:";

export function createBlockPreviewClassName({ route, label }: { route: string; label?: string }): string {
    const classNames = [`${ROUTE_CLASS_PREFIX}${encodeURIComponent(route)}`];

    if (label !== undefined) {
        classNames.push(`${LABEL_CLASS_PREFIX}${encodeURIComponent(label)}`);
    }

    return classNames.join(" ");
}

export function getBlockAdminRoute(data: unknown): string | undefined {
    if (typeof data !== "object" || data === null || !("adminMeta" in data)) {
        return undefined;
    }

    const { adminMeta } = data;

    if (typeof adminMeta !== "object" || adminMeta === null || !("route" in adminMeta)) {
        return undefined;
    }

    return typeof adminMeta.route === "string" ? adminMeta.route : undefined;
}

export const PREVIEW_ROUTE_CLASS_SELECTOR = `[class*="${ROUTE_CLASS_PREFIX}"]`;

function readClassNameValue(element: Element, prefix: string): string | undefined {
    const className = Array.from(element.classList).find((name) => name.startsWith(prefix));

    return className === undefined ? undefined : decodeURIComponent(className.slice(prefix.length));
}

export function readPreviewRouteAndLabelFromClassNames(element: Element): { adminRoute: string; label: string } | undefined {
    const adminRoute = readClassNameValue(element, ROUTE_CLASS_PREFIX);

    if (adminRoute === undefined) {
        return undefined;
    }

    return { adminRoute, label: readClassNameValue(element, LABEL_CLASS_PREFIX) ?? "" };
}
