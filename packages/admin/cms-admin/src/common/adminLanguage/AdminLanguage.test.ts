import { afterEach, describe, expect, it, vi } from "vitest";

import { getClosestSupportedLanguageFromBrowserLanguages } from "./AdminLanguage";

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

    it("prefers a supported language with the same region", () => {
        stubBrowserLanguages(["de-AT", "en-US"]);

        expect(getClosestSupportedLanguageFromBrowserLanguages(["en", "de-DE", "de-AT"], "en")).toBe("de-AT");
    });

    it("returns a supported language with another region if none matches the browser language's region", () => {
        stubBrowserLanguages(["de-CH", "en-US"]);

        expect(getClosestSupportedLanguageFromBrowserLanguages(["en", "de-AT"], "en")).toBe("de-AT");
    });

    it("returns the fallback language if no browser language is supported", () => {
        stubBrowserLanguages(["fr-FR"]);

        expect(getClosestSupportedLanguageFromBrowserLanguages(["en", "de"], "en")).toBe("en");
    });
});
