import { describe, expect, it } from "vitest";

import { splitSearchString } from "../common/filter/mikro-orm";
import { findMessagesMatchingSearchPart } from "./warning-search.helper";

const messageLabels = [
    { message: "fileLicenseSoonToExpire", label: "File license expires soon" },
    { message: "fileLicenseExpired", label: "File license expired" },
    { message: "missingAltText", label: "Missing alt text (100%)" },
];

function findMessagesMatchingSearch(search: string) {
    return splitSearchString(search).map((searchPart) => findMessagesMatchingSearchPart(searchPart, messageLabels));
}

describe("findMessagesMatchingSearchPart", () => {
    it("matches every word of the displayed message", () => {
        expect(findMessagesMatchingSearch("File license expires soon")).toEqual([
            ["fileLicenseSoonToExpire", "fileLicenseExpired"],
            ["fileLicenseSoonToExpire", "fileLicenseExpired"],
            ["fileLicenseSoonToExpire"],
            ["fileLicenseSoonToExpire"],
        ]);
    });

    it("matches parts of words case-insensitively", () => {
        expect(findMessagesMatchingSearch("EXPIR")).toEqual([["fileLicenseSoonToExpire", "fileLicenseExpired"]]);
    });

    it("matches a quoted phrase as a whole", () => {
        expect(findMessagesMatchingSearch('"license expires"')).toEqual([["fileLicenseSoonToExpire"]]);
    });

    it("treats % and _ in the search as literal characters", () => {
        expect(findMessagesMatchingSearch("100%")).toEqual([["missingAltText"]]);
        expect(findMessagesMatchingSearch("file_license")).toEqual([[]]);
    });

    it("matches nothing when no labels are given", () => {
        expect(findMessagesMatchingSearchPart("%soon%", [])).toEqual([]);
    });
});
