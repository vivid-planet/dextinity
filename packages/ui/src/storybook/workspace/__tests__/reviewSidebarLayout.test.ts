import { describe, expect, it } from "vitest";

import { getReviewSidebarLayout } from "../reviewSidebarLayout";

describe("getReviewSidebarLayout", () => {
    it("keeps the sidebar and the prototypes panel next to the canvas on a wide screen", () => {
        expect(getReviewSidebarLayout({ bodyWidth: 1440, panelWidth: 300 })).toEqual({ sidebarOverlay: false, panelOverlay: false });
    });

    it("lets the prototypes panel cover the canvas when both panels would leave too little room", () => {
        expect(getReviewSidebarLayout({ bodyWidth: 1024, panelWidth: 300 })).toEqual({ sidebarOverlay: false, panelOverlay: true });
    });

    it("lets the sidebar cover the canvas when it alone would leave too little room", () => {
        expect(getReviewSidebarLayout({ bodyWidth: 800, panelWidth: 300 })).toEqual({ sidebarOverlay: true, panelOverlay: false });
    });

    it("keeps the sidebar next to a canvas of exactly the minimum width", () => {
        expect(getReviewSidebarLayout({ bodyWidth: 840, panelWidth: 0 })).toEqual({ sidebarOverlay: false, panelOverlay: false });
    });
});
