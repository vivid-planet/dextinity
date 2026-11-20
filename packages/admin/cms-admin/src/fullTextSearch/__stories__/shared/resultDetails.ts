export interface ResultDetail {
    label: string;
    color: "default" | "primary" | "success" | "warning" | "error";
}

const online: ResultDetail = { label: "Online", color: "success" };
const offline: ResultDetail = { label: "Offline", color: "default" };
const published: ResultDetail = { label: "Published", color: "success" };
const draft: ResultDetail = { label: "Draft", color: "default" };

/**
 * Up to two chips with additional information shown next to a result. The full-text search API doesn't return this yet,
 * it would need an additional field on `EntityInfo` (e.g. a status, a price or a file size, depending on the entity).
 */
const resultDetails: Record<string, ResultDetail[]> = {
    p1: [online, { label: "Main navigation", color: "primary" }],
    p2: [online, { label: "Main navigation", color: "primary" }],
    p3: [online],
    p4: [online, { label: "Footer", color: "primary" }],
    p5: [online, { label: "Main navigation", color: "primary" }],
    p6: [offline],
    p7: [online, { label: "Footer", color: "primary" }],
    p8: [online, { label: "Footer", color: "primary" }],
    p9: [offline],
    p10: [online],
    n1: [published],
    n2: [published, { label: "Featured", color: "primary" }],
    n3: [draft],
    n4: [published],
    n5: [published],
    pr1: [
        { label: "€ 2.499", color: "default" },
        { label: "In stock", color: "success" },
    ],
    pr2: [
        { label: "€ 2.899", color: "default" },
        { label: "Sold out", color: "error" },
    ],
    pr3: [
        { label: "€ 649", color: "default" },
        { label: "In stock", color: "success" },
    ],
    pr4: [
        { label: "€ 89", color: "default" },
        { label: "Few left", color: "warning" },
    ],
    d1: [
        { label: "JPG", color: "primary" },
        { label: "2,4 MB", color: "default" },
    ],
    d2: [
        { label: "SVG", color: "primary" },
        { label: "12 KB", color: "default" },
    ],
    d3: [
        { label: "PNG", color: "primary" },
        { label: "1,1 MB", color: "default" },
    ],
    d4: [
        { label: "PDF", color: "primary" },
        { label: "830 KB", color: "default" },
    ],
    d5: [
        { label: "PDF", color: "primary" },
        { label: "210 KB", color: "default" },
    ],
    r1: [{ label: "301", color: "primary" }],
    r2: [{ label: "301", color: "primary" }],
    r3: [{ label: "302", color: "warning" }],
};

export function getResultDetails(id: string): ResultDetail[] {
    return resultDetails[id] ?? [];
}
