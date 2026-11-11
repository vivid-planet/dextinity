import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MainNavigationItem } from "../MainNavigationItem";

afterEach(cleanup);

describe("MainNavigationItem", () => {
    it("marks the active item as the current page and emits its level", () => {
        render(
            <>
                <MainNavigationItem href="/dashboard">Dashboard</MainNavigationItem>
                <MainNavigationItem href="/users" level={2} active>
                    Users
                </MainNavigationItem>
            </>,
        );

        const dashboard = screen.getByRole("link", { name: "Dashboard" });
        expect([dashboard.getAttribute("aria-current"), dashboard.dataset.level]).toStrictEqual([null, "1"]);
        const users = screen.getByRole("link", { name: "Users" });
        expect([users.getAttribute("aria-current"), users.dataset.level, users.dataset.active]).toStrictEqual(["page", "2", ""]);
    });
});

describe("MainNavigationItem slots", () => {
    it("renders a slot as the element chosen in `slots`, merging the contract class with consumer props", () => {
        render(
            <MainNavigationItem href="/users" slots={{ label: "strong" }} slotProps={{ label: { className: "consumer-class", title: "Users" } }}>
                Users
            </MainNavigationItem>,
        );

        const label = screen.getByTitle("Users");
        expect(label.tagName).toBe("STRONG");
        expect(label.className).toContain("consumer-class");
        expect(label.className).toContain("label");
    });
});
