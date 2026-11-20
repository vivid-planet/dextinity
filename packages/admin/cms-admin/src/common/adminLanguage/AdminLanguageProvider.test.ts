import { afterEach, describe, expect, it, vi } from "vitest";

import { getClosestSupportedLanguageFromBrowserLanguages } from "./AdminLanguageProvider";

describe("getClosestSupportedLanguageFromBrowserLanguages", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function stubBrowserLanguages(languages: string[]) {
        vi.stubGlobal("navigator", { languages, language: languages[0] });
    }

    it("returns the first supported browser language, ignoring the region", () => {
        stubBrowserLanguages(["fr-FR", "de-AT", "en-US"]);

        expect(getClosestSupportedLanguageFromBrowserLanguages(["en", "de"], "en")).toBe("de");
    });

    it("returns the fallback language if no browser language is supported", () => {
        stubBrowserLanguages(["fr-FR"]);

        expect(getClosestSupportedLanguageFromBrowserLanguages(["en", "de"], "en")).toBe("en");
    });
});
