import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ShortcutList } from "./ShortcutList";

afterEach(cleanup);

describe("ShortcutList", () => {
    it("renders the contract classes and one key cap per key", () => {
        render(<ShortcutList className="consumer-class" shortcuts={[{ keys: ["⌘", "X", "⌘", "V"], description: "Cut and paste" }]} />);

        const table = screen.getByRole("table");
        expect(table.className).toContain("dextinityShortcutList");
        expect(table.className).toContain("consumer-class");
        expect(table.querySelector(".dextinityShortcutList__keys")?.querySelectorAll("kbd")).toHaveLength(4);
    });
});
