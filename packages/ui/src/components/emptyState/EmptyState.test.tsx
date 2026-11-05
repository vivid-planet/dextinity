import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

afterEach(cleanup);

describe("EmptyState", () => {
    it("renders the contract classes", () => {
        const { container } = render(
            <EmptyState
                title="No results"
                description="Reset the filters."
                icon={<span>i</span>}
                actions={<button type="button">Reset</button>}
                className="consumer-class"
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityEmptyState");
        expect(root.className).toContain("consumer-class");
        expect(screen.getByText("i").parentElement?.className).toContain("dextinityEmptyState__icon");
        expect(screen.getByRole("heading", { level: 3, name: "No results" }).className).toContain("dextinityEmptyState__title");
        expect(screen.getByText("Reset the filters.").className).toContain("dextinityEmptyState__description");
        expect(screen.getByRole("button").parentElement?.className).toContain("dextinityEmptyState__actions");
    });
});
