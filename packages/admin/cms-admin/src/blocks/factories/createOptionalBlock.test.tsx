import { RouterMemoryRouter } from "@dextinity/admin";
import { Route, Routes } from "react-router";
import { cleanup, render, screen } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory } from "../types";
import { createOptionalBlock } from "./createOptionalBlock";

describe("createOptionalBlock", () => {
    it("should override block's values", () => {
        const nameOverride = "override name";
        const block = createOptionalBlock(
            {
                ...createBlockSkeleton(),
                name: "testBlocksBlock",
                displayName: "Test List Block",
                category: BlockCategory.Layout,
                defaultValues: () => ({}),
            },
            {},
            (block) => {
                block.name = nameOverride;
                return block;
            },
        );
        expect(block.name).toBe(nameOverride);
    });

    describe("AdminComponent", () => {
        afterEach(() => {
            cleanup();
        });

        const OptionalBlock = createOptionalBlock(
            {
                ...createBlockSkeleton(),
                name: "Decorated",
                displayName: "Decorated block",
                category: BlockCategory.Other,
                defaultValues: () => ({}),
                AdminComponent: () => <div>Decorated block form</div>,
            },
            { title: "Optional block title" },
        );

        function renderOnEditPage(initialEntry: string) {
            render(
                <RouterMemoryRouter initialEntries={[initialEntry]}>
                    <Routes>
                        <Route
                            path="/page/edit/*"
                            element={
                                <OptionalBlock.AdminComponent
                                    state={{ visible: true, block: {} }}
                                    updateState={() => {
                                        // not needed
                                    }}
                                />
                            }
                        />
                    </Routes>
                </RouterMemoryRouter>,
            );
        }

        it("should show the decorated block in a collapsible at the URL of the route", () => {
            renderOnEditPage("/page/edit");

            expect(screen.getByText("Optional block title")).toBeTruthy();
            expect(screen.getByText("Decorated block form")).toBeTruthy();
        });

        it("should only show the decorated block below the URL of the route", () => {
            renderOnEditPage("/page/edit/link/edit");

            expect(screen.queryByText("Optional block title")).toBeNull();
            expect(screen.getByText("Decorated block form")).toBeTruthy();
        });
    });
});
