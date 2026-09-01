import { cleanup, fireEvent, render, screen, within } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContentScopeControls } from "./Controls";
import type { ContentScopeValues } from "./Provider";

let mockValues: ContentScopeValues = [];

vi.mock("./Provider", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./Provider")>();
    return {
        ...actual,
        useContentScope: () => ({
            scope: mockValues[0]?.scope ?? {},
            setScope: vi.fn(),
            values: mockValues,
        }),
    };
});

describe("ContentScopeControls", () => {
    afterEach(() => {
        cleanup();
    });

    it("does not group and does not crash when scopes have different shapes", () => {
        mockValues = [
            { scope: { domain: "main" }, label: { domain: "Main" } },
            { scope: { company: "acme" }, label: { company: "Acme" } },
        ];

        render(<ContentScopeControls />);

        const [button] = screen.getAllByRole("button");
        expect(() => fireEvent.click(button)).not.toThrow();

        const list = within(screen.getByRole("list"));
        list.getByText("Acme");
        list.getByText("Main");
    });

    it("groups by the shared dimension when all scopes have the same shape", () => {
        mockValues = [
            { scope: { domain: "main", language: "en" }, label: { domain: "Main", language: "EN" } },
            { scope: { domain: "main", language: "de" }, label: { domain: "Main", language: "DE" } },
            { scope: { domain: "secondary", language: "fr" }, label: { domain: "Secondary", language: "FR" } },
        ];

        render(<ContentScopeControls />);

        const [button] = screen.getAllByRole("button");
        fireEvent.click(button);

        const list = within(screen.getByRole("list"));

        // Grouped by "domain" (the shared dimension), so its values appear as group headers ...
        list.getByText("Main");
        list.getByText("Secondary");
        // ... and the options within a group are rendered by their other dimension only.
        list.getByText("EN");
        list.getByText("DE");
        list.getByText("FR");
    });
});
