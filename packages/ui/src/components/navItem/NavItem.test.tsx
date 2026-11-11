import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NavItem } from "./NavItem";

afterEach(cleanup);

describe("NavItem", () => {
    it("marks the active item as the current page and emits its level", () => {
        render(
            <>
                <NavItem href="/dashboard">Dashboard</NavItem>
                <NavItem href="/users" level={2} active>
                    Users
                </NavItem>
            </>,
        );

        const dashboard = screen.getByRole("link", { name: "Dashboard" });
        expect([dashboard.getAttribute("aria-current"), dashboard.dataset.level]).toStrictEqual([null, "1"]);
        const users = screen.getByRole("link", { name: "Users" });
        expect([users.getAttribute("aria-current"), users.dataset.level, users.dataset.active]).toStrictEqual(["page", "2", ""]);
    });
});

describe("NavItem slots", () => {
    it("renders a slot as the element chosen in `slots`, merging the contract class with consumer props", () => {
        render(
            <NavItem href="/users" slots={{ label: "strong" }} slotProps={{ label: { className: "consumer-class", title: "Users" } }}>
                Users
            </NavItem>,
        );

        const label = screen.getByTitle("Users");
        expect(label.tagName).toBe("STRONG");
        expect(label.className).toContain("consumer-class");
        expect(label.className).toContain("label");
    });
});
