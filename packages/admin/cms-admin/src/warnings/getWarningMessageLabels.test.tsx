import { createIntl, defineMessage, FormattedMessage } from "react-intl";
import { describe, expect, it } from "vitest";

import { getWarningMessageLabels } from "./getWarningMessageLabels";

const intl = createIntl({ locale: "en", messages: {} });

function ReviewRequiredMessage() {
    return <span>Review required</span>;
}

describe("getWarningMessageLabels", () => {
    it("reads the label from the message", () => {
        expect(
            getWarningMessageLabels({ messages: { missingTitle: <FormattedMessage id="missingTitle" defaultMessage="Title is missing" /> } }, intl),
        ).toEqual([{ message: "missingTitle", label: "Title is missing" }]);
    });

    it("prefers a configured string label", () => {
        expect(
            getWarningMessageLabels(
                { messages: { reviewRequired: <ReviewRequiredMessage /> }, messageLabels: { reviewRequired: "Review required" } },
                intl,
            ),
        ).toEqual([{ message: "reviewRequired", label: "Review required" }]);
    });

    it("formats a configured message descriptor label", () => {
        expect(
            getWarningMessageLabels(
                {
                    messages: { reviewRequired: <ReviewRequiredMessage /> },
                    messageLabels: { reviewRequired: defineMessage({ id: "reviewRequired", defaultMessage: "Review required" }) },
                },
                intl,
            ),
        ).toEqual([{ message: "reviewRequired", label: "Review required" }]);
    });

    it("falls back to the key when neither the message nor a label provide a text", () => {
        expect(getWarningMessageLabels({ messages: { reviewRequired: <ReviewRequiredMessage /> } }, intl)).toEqual([
            { message: "reviewRequired", label: "reviewRequired" },
        ]);
    });
});
