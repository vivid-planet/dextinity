import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KeyValueList } from "./KeyValueList";

afterEach(cleanup);

describe("KeyValueList", () => {
    it("renders a term and a definition per item with the contract classes", () => {
        const { container } = render(
            <KeyValueList
                items={[
                    { key: "Template", value: "Careers" },
                    { key: "Changed", value: "12 min ago" },
                ]}
                layout="stacked"
                className="consumer-class"
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.tagName).toBe("DL");
        expect(root.className).toContain("dextinityKeyValueList");
        expect(root.className).toContain("consumer-class");
        expect(root.dataset.layout).toBe("stacked");
        expect(screen.getAllByRole("term").map((term) => term.textContent)).toStrictEqual(["Template", "Changed"]);
        expect(screen.getAllByRole("definition").map((definition) => definition.className)).toStrictEqual([
            expect.stringContaining("dextinityKeyValueList__value"),
            expect.stringContaining("dextinityKeyValueList__value"),
        ]);
        expect(screen.getByText("Template").className).toContain("dextinityKeyValueList__key");
    });
});
