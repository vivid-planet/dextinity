import { beforeEach, describe, expect, it } from "vitest";

import { isClientNavigationClick } from "./isClientNavigationClick.js";

function createLink(href: string, attributes: Record<string, string> = {}) {
    const link = document.createElement("a");
    link.href = href;
    for (const [name, value] of Object.entries(attributes)) {
        link.setAttribute(name, value);
    }
    return link;
}

function createClick(init: MouseEventInit = {}) {
    return new MouseEvent("click", { button: 0, cancelable: true, ...init });
}

describe("isClientNavigationClick", () => {
    beforeEach(() => {
        window.history.replaceState(null, "", "/en/news?page=1");
    });

    it("navigates on the client for a left click on a page of this site", () => {
        expect(isClientNavigationClick(createClick(), createLink("/en/products"))).toBe(true);
    });

    it("navigates on the client for a link to another page with a hash", () => {
        expect(isClientNavigationClick(createClick(), createLink("/en/products#details"))).toBe(true);
    });

    it("navigates on the client for target _self", () => {
        expect(isClientNavigationClick(createClick(), createLink("/en/products", { target: "_self" }))).toBe(true);
    });

    it.each([
        ["middle click", { button: 1 }],
        ["meta key", { metaKey: true }],
        ["ctrl key", { ctrlKey: true }],
        ["alt key", { altKey: true }],
        ["shift key", { shiftKey: true }],
    ])("leaves the %s to the browser", (_, init) => {
        expect(isClientNavigationClick(createClick(init), createLink("/en/products"))).toBe(false);
    });

    it("leaves prevented clicks to the browser", () => {
        const event = createClick();
        event.preventDefault();

        expect(isClientNavigationClick(event, createLink("/en/products"))).toBe(false);
    });

    it("leaves links with another target to the browser", () => {
        expect(isClientNavigationClick(createClick(), createLink("/en/products", { target: "_blank" }))).toBe(false);
    });

    it("leaves downloads to the browser", () => {
        expect(isClientNavigationClick(createClick(), createLink("/en/products", { download: "" }))).toBe(false);
    });

    it("leaves links to other origins to the browser", () => {
        expect(isClientNavigationClick(createClick(), createLink("https://example.com/en/products"))).toBe(false);
    });

    it("leaves hash changes on the current page to the browser", () => {
        expect(isClientNavigationClick(createClick(), createLink("/en/news?page=1#footer"))).toBe(false);
    });

    it("navigates on the client for a hash on the current pathname with other search params", () => {
        expect(isClientNavigationClick(createClick(), createLink("/en/news?page=2#footer"))).toBe(true);
    });
});
