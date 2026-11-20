/**
 * Additional information shown as a chip next to a result. The full-text search API doesn't return this yet, it would
 * need an additional field on `EntityInfo` (e.g. a status, a price or a file size, depending on the entity).
 */
const resultDetails: Record<string, string> = {
    p1: "Online",
    p2: "Online",
    p3: "Online",
    p4: "Online",
    p5: "Online",
    p6: "Offline",
    p7: "Online",
    p8: "Online",
    p9: "Offline",
    p10: "Online",
    n1: "Published",
    n2: "Published",
    n3: "Draft",
    n4: "Published",
    n5: "Published",
    pr1: "€ 2.499",
    pr2: "€ 2.899",
    pr3: "€ 649",
    pr4: "€ 89",
    d1: "2,4 MB",
    d2: "12 KB",
    d3: "1,1 MB",
    d4: "830 KB",
    d5: "210 KB",
    r1: "301",
    r2: "301",
    r3: "302",
};

export function getResultDetail(id: string): string | undefined {
    return resultDetails[id];
}
