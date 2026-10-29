import { beforeEach, describe, expect, it } from "vitest";

import { announceNavigation, setUpNavigationAnnouncer } from "./announceNavigation";

function getAnnouncement() {
    return document.querySelector("[aria-live]")?.textContent;
}

describe("announceNavigation", () => {
    beforeEach(() => {
        document.title = "";
        document.body.innerHTML = "";
        window.history.replaceState(null, "", "/en/news");
    });

    it("announces the title of the new page", () => {
        setUpNavigationAnnouncer();
        document.title = "News";

        announceNavigation();

        expect(getAnnouncement()).toBe("News");
    });

    it("announces the heading if the page has no title", () => {
        document.body.innerHTML = "<h1>Latest news</h1>";

        announceNavigation();

        expect(getAnnouncement()).toBe("Latest news");
    });

    it("announces the pathname if the page has neither title nor heading", () => {
        announceNavigation();

        expect(getAnnouncement()).toBe("/en/news");
    });

    it("adds the announcer again after it was removed from the body", () => {
        setUpNavigationAnnouncer();
        document.body.innerHTML = "<main></main>";
        document.title = "News";

        announceNavigation();

        expect(getAnnouncement()).toBe("News");
    });

    it("moves the focus to the start of the document", () => {
        document.body.innerHTML = '<a href="/en/news">News</a>';
        document.querySelector("a")?.focus();

        announceNavigation();

        expect(document.activeElement).toBe(document.body);
        expect(document.body.hasAttribute("tabindex")).toBe(false);
    });
});
