import { describe, expect, it } from "vitest";

import { isAiHubConfigured } from "./aiHubConfig";

const scriptSrc = "https://ai-hub.test/ai-hub-chat.mjs";

describe("isAiHubConfigured", () => {
    it("returns true with the script of the web component and the widget ID", () => {
        expect(isAiHubConfigured({ aiHubWebComponentScriptSrc: scriptSrc, aiHubWidgetId: "widget" })).toBe(true);
    });

    it("returns false without the script of the web component", () => {
        expect(isAiHubConfigured({ aiHubWidgetId: "widget" })).toBe(false);
        expect(isAiHubConfigured({ aiHubWebComponentScriptSrc: "", aiHubWidgetId: "widget" })).toBe(false);
    });

    it("returns false without the widget ID", () => {
        expect(isAiHubConfigured({ aiHubWebComponentScriptSrc: scriptSrc })).toBe(false);
        expect(isAiHubConfigured({ aiHubWebComponentScriptSrc: scriptSrc, aiHubWidgetId: "" })).toBe(false);
    });
});
