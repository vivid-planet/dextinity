import { expect, it } from "vitest";

import { removePreviewElementFromList } from "./utils";

it("removes only the copy that unmounted when copies share a route", () => {
    const firstCopy = { adminRoute: "cell", label: "Cell", element: document.createElement("div") };
    const secondCopy = { adminRoute: "cell", label: "Cell", element: document.createElement("div") };

    expect(removePreviewElementFromList([firstCopy, secondCopy], secondCopy)).toEqual([firstCopy]);
});
