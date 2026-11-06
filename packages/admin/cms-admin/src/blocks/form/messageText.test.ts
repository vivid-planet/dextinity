import { createElement } from "react";
import { createIntl, FormattedMessage } from "react-intl";
import { describe, expect, it } from "vitest";

import { messageText } from "./messageText";

const intl = createIntl({ locale: "en", messages: { "test.translated": "Übersetzt" } });

describe("messageText", () => {
    it("returns strings and numbers as text", () => {
        expect(messageText(intl, "Primary")).toBe("Primary");
        expect(messageText(intl, 50)).toBe("50");
    });

    it("formats a message descriptor", () => {
        expect(messageText(intl, { id: "test.translated", defaultMessage: "Translated" })).toBe("Übersetzt");
    });

    it("formats a FormattedMessage element with its values", () => {
        const label = createElement(FormattedMessage, { id: "test.headline", defaultMessage: "Headline {level}", values: { level: 3 } });
        expect(messageText(intl, label)).toBe("Headline 3");
    });

    it("returns undefined for other elements", () => {
        expect(messageText(intl, createElement("span", null, "Icon"))).toBeUndefined();
    });
});
