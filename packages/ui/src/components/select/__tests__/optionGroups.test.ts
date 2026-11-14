import { describe, expect, it } from "vitest";

import { groupOptions, hasGroups } from "../optionGroups";

const options = [
    { value: "vienna", group: "Austria" },
    { value: "munich", group: "Germany" },
    { value: "remote", group: undefined },
    { value: "graz", group: "Austria" },
];

describe("groupOptions", () => {
    it("gathers the options under their group in the order the groups first appear", () => {
        expect(groupOptions(options, (option) => option.group)).toStrictEqual([
            { label: "Austria", items: [options[0], options[3]] },
            { label: "Germany", items: [options[1]] },
            { label: undefined, items: [options[2]] },
        ]);
    });

    it("tells whether any option has a group", () => {
        expect(hasGroups(options, (option) => option.group)).toBe(true);
        expect(hasGroups(options, () => undefined)).toBe(false);
    });
});
