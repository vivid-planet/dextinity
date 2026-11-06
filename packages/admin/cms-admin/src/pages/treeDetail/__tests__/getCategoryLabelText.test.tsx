import { createIntl, FormattedMessage } from "react-intl";
import { describe, expect, it } from "vitest";

import { getCategoryLabelText } from "../getCategoryLabelText";

const intl = createIntl({ locale: "en", messages: { "menu.topMenu": "Oberes Menü" } });

describe("getCategoryLabelText", () => {
    it("formats a FormattedMessage label with the current messages", () => {
        const label = <FormattedMessage id="menu.topMenu" defaultMessage="Top menu" />;
        expect(getCategoryLabelText({ category: "topMenu", label }, intl)).toBe("Oberes Menü");
    });

    it("keeps a text label and falls back to the category for other elements", () => {
        expect(getCategoryLabelText({ category: "main", label: "Main navigation" }, intl)).toBe("Main navigation");
        expect(getCategoryLabelText({ category: "main", label: <strong>Main</strong> }, intl)).toBe("main");
    });
});
