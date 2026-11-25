import { createIntl, FormattedMessage } from "react-intl";
import { describe, expect, it } from "vitest";

import { getDisplayNameString } from "./getDisplayNameString";

const intl = createIntl({ locale: "en", messages: {} });

function CustomLabel() {
    return <span>Rendered by the component</span>;
}

describe("getDisplayNameString", () => {
    it("returns a string as it is", () => {
        expect(getDisplayNameString("Page", intl, "fallback")).toBe("Page");
    });

    it("formats a FormattedMessage", () => {
        expect(getDisplayNameString(<FormattedMessage id="page" defaultMessage="Page" />, intl, "fallback")).toBe("Page");
    });

    it("formats a FormattedMessage with values", () => {
        expect(
            getDisplayNameString(<FormattedMessage id="expires" defaultMessage="Expires in {days} days" values={{ days: 3 }} />, intl, "fallback"),
        ).toBe("Expires in 3 days");
    });

    it("reads the text of nested elements", () => {
        expect(
            getDisplayNameString(
                <span>
                    Review <strong>required</strong>
                </span>,
                intl,
                "fallback",
            ),
        ).toBe("Review required");
    });

    it("reads a FormattedMessage nested in other elements", () => {
        expect(
            getDisplayNameString(
                <>
                    <FormattedMessage id="file" defaultMessage="File" />: <FormattedMessage id="expired" defaultMessage="expired" />
                </>,
                intl,
                "fallback",
            ),
        ).toBe("File: expired");
    });

    it("falls back when the text is rendered by a component", () => {
        expect(getDisplayNameString(<CustomLabel />, intl, "fallback")).toBe("fallback");
    });

    it("falls back for empty nodes", () => {
        expect(getDisplayNameString(null, intl, "fallback")).toBe("fallback");
        expect(getDisplayNameString(" ", intl, "fallback")).toBe("fallback");
    });
});
