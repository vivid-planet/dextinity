import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MenuSectionHeader } from "../MenuSectionHeader";

afterEach(cleanup);

describe("MenuSectionHeader", () => {
    it("emits the expand icon and `data-expandable` only for an expandable section", () => {
        render(
            <>
                <MenuSectionHeader data-testid="static">Pages</MenuSectionHeader>
                <MenuSectionHeader data-testid="expandable" expandable>
                    Settings
                </MenuSectionHeader>
            </>,
        );

        const staticHeader = screen.getByTestId("static");
        expect([staticHeader.hasAttribute("data-expandable"), staticHeader.querySelector(".dextinityMenuSectionHeader__expandIcon")]).toStrictEqual([
            false,
            null,
        ]);
        const expandableHeader = screen.getByTestId("expandable");
        expect(expandableHeader.hasAttribute("data-expandable")).toBe(true);
        expect(expandableHeader.querySelector(".dextinityMenuSectionHeader__expandIcon")).not.toBeNull();
    });

    it("renders the action part only when the action has content", () => {
        render(
            <>
                <MenuSectionHeader data-testid="without-action" action={false}>
                    Pages
                </MenuSectionHeader>
                <MenuSectionHeader data-testid="with-action" action={<button type="button">Add</button>}>
                    Pages
                </MenuSectionHeader>
            </>,
        );

        expect(screen.getByTestId("without-action").querySelector(".dextinityMenuSectionHeader__action")).toBeNull();
        expect(screen.getByTestId("with-action").querySelector(".dextinityMenuSectionHeader__action")).not.toBeNull();
    });

    it("keeps the action outside a button label, so it doesn't toggle the section", () => {
        render(
            <MenuSectionHeader expandable slots={{ label: "button" }} action={<button type="button">Add page</button>}>
                Content
            </MenuSectionHeader>,
        );

        expect(screen.getByRole("button", { name: "Content" }).contains(screen.getByRole("button", { name: "Add page" }))).toBe(false);
    });
});
