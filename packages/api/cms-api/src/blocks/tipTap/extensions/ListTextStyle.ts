import { Extension } from "@tiptap/core";

import { textStyleAttribute } from "./textBlockAttributes";

/**
 * Adds the `textStyle` attribute to the list nodes that are configured with styles. It sits on the
 * list rather than on its items, so every item of a list shares one style while a nested list keeps
 * its own.
 *
 * The lists come from StarterKit, so the attribute is added globally instead of by extending them.
 */
export function createListTextStyle(types: string[]) {
    return Extension.create({
        name: "listTextStyle",

        addGlobalAttributes() {
            return [{ types, attributes: textStyleAttribute }];
        },
    });
}
