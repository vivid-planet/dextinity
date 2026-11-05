const allowedAttributes: Record<string, string[]> = {
    P: [],
    BR: [],
    STRONG: [],
    B: [],
    EM: [],
    I: [],
    A: ["href"],
    UL: [],
    OL: [],
    LI: [],
    H3: [],
};

const renamedElements: Record<string, string> = {
    DIV: "p",
    H1: "h3",
    H2: "h3",
    H4: "h3",
    H5: "h3",
    H6: "h3",
};

const droppedElements = new Set(["SCRIPT", "STYLE", "TEMPLATE", "IFRAME", "OBJECT", "EMBED", "NOSCRIPT"]);

const safeHrefPattern = /^(https?:|mailto:|tel:|\/|#)/i;

/**
 * Whether a link target is safe to render: http(s), mail, phone, or a relative path.
 */
export function isSafeHref(href: string) {
    return safeHrefPattern.test(href.trim());
}

function cleanChildren(parent: Node) {
    for (const child of Array.from(parent.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
            continue;
        }
        if (!(child instanceof Element) || droppedElements.has(child.tagName)) {
            child.remove();
            continue;
        }

        cleanChildren(child);

        let element: Element = child;
        const renamed = renamedElements[element.tagName];
        if (renamed != null) {
            const replacement = element.ownerDocument.createElement(renamed);
            replacement.append(...Array.from(element.childNodes));
            element.replaceWith(replacement);
            element = replacement;
        }

        const allowed = allowedAttributes[element.tagName];
        if (allowed == null) {
            element.replaceWith(...Array.from(element.childNodes));
            continue;
        }
        for (const attribute of Array.from(element.attributes)) {
            if (!allowed.includes(attribute.name) || (attribute.name === "href" && !isSafeHref(attribute.value))) {
                element.removeAttribute(attribute.name);
            }
        }
    }
}

/**
 * Keeps only the formatting the rich text editor produces: paragraphs, bold, italic, links, lists, and level-3 headings.
 * Everything else is unwrapped to its text; scripts and unsafe link targets are removed.
 */
export function sanitizeHtml(html: string): string {
    const document = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
    cleanChildren(document.body);
    return document.body.innerHTML;
}
