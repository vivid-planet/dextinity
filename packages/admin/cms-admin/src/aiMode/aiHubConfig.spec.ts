import { describe, expect, it } from "vitest";

import { isAiHubConfigured } from "./aiHubConfig";

const scriptSrc = "https://ai-hub.test/ai-hub-chat.mjs";

describe("isAiHubConfigured", () => {
    it("returns true with the script of the web component and the widget ID", () => {
        expect(isAiHubConfigured({ webComponentScriptSrc: scriptSrc, widgetId: "widget" })).toBe(true);
    });

    it("returns false without the script of the web component", () => {
        expect(isAiHubConfigured({ widgetId: "widget" })).toBe(false);
        expect(isAiHubConfigured({ webComponentScriptSrc: "", widgetId: "widget" })).toBe(false);
    });

    it("returns false without the widget ID", () => {
        expect(isAiHubConfigured({ webComponentScriptSrc: scriptSrc })).toBe(false);
        expect(isAiHubConfigured({ webComponentScriptSrc: scriptSrc, widgetId: "" })).toBe(false);
    });
});
