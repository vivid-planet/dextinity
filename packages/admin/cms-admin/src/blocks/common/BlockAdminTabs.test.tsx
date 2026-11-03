import { RouterBrowserRouter, RouterMemoryRouter, SubRoute, useCurrentRouteMatch, useSubRoutePrefix } from "@dextinity/admin";
import { type ReactNode, useState } from "react";
import { Link, type Location, Route, Routes } from "react-router";
import { cleanup, fireEvent, LocationSpy, render, screen, waitFor } from "test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { BlockAdminTabs } from "./BlockAdminTabs";

function TabContent({ name }: { name: string }) {
    const routeUrl = useCurrentRouteMatch()?.url;
    const subRoutePrefix = useSubRoutePrefix();
    return (
        <div>
            {name}: {routeUrl} {subRoutePrefix}
        </div>
    );
}

const tabs = [
    { key: "content", label: "Content tab", content: <TabContent name="Content" /> },
    { key: "stage", label: "Stage tab", content: <TabContent name="Stage" /> },
    { key: "config", label: "Config tab", content: <TabContent name="Config" /> },
];

let location: Location | undefined;

function handleLocationChange(newLocation: Location) {
    location = newLocation;
}

function renderOnEditPage(initialEntry: string, children: ReactNode = <BlockAdminTabs>{tabs}</BlockAdminTabs>) {
    return render(
        <RouterMemoryRouter initialEntries={[initialEntry]}>
            <LocationSpy onChange={handleLocationChange} />
            <Routes>
                <Route path="/page/edit/*" element={children} />
            </Routes>
        </RouterMemoryRouter>,
    );
}

function getSelectedTab() {
    return screen.getAllByRole("tab").find((tab) => tab.getAttribute("aria-selected") === "true")?.textContent;
}

describe("BlockAdminTabs", () => {
    beforeAll(() => {
        // Not implemented by jsdom, used for the scroll restoration of the tab content
        Element.prototype.scrollTo = vi.fn();
    });

    afterAll(() => {
        delete (Element.prototype as Partial<Element>).scrollTo;
    });

    afterEach(() => {
        cleanup();
        location = undefined;
    });

    it("should link the first tab to the URL of the route and the other tabs below it", () => {
        renderOnEditPage("/page/edit");

        expect(screen.getAllByRole("tab").map((tab) => tab.getAttribute("href"))).toEqual(["/page/edit", "/page/edit/stage", "/page/edit/config"]);
    });

    it("should show the first tab at the URL of the route", () => {
        renderOnEditPage("/page/edit");

        expect(getSelectedTab()).toBe("Content tab");
        expect(screen.getByText("Content: /page/edit /page/edit")).toBeTruthy();
        expect(screen.queryByText(/^Stage:/)).toBeNull();
    });

    it("should show another tab and publish its URL as route for its content", () => {
        renderOnEditPage("/page/edit/stage/blocks/block-key/edit");

        expect(getSelectedTab()).toBe("Stage tab");
        expect(screen.getByText("Stage: /page/edit/stage /page/edit/stage")).toBeTruthy();
        expect(screen.queryByText(/^Content:/)).toBeNull();
    });

    it("should show the tab at an encoded URL of the route", () => {
        render(
            <RouterMemoryRouter initialEntries={["/p%C3%A4ge/edit/stage"]}>
                <Routes>
                    <Route path="/:page/edit/*" element={<BlockAdminTabs>{tabs}</BlockAdminTabs>} />
                </Routes>
            </RouterMemoryRouter>,
        );

        expect(getSelectedTab()).toBe("Stage tab");
        expect(screen.getByText("Stage: /päge/edit/stage /päge/edit/stage")).toBeTruthy();
    });

    describe("in browser history", () => {
        afterEach(() => {
            window.history.replaceState(null, "", "/");
        });

        it("should show the tab at a URL of the route that is encoded differently", async () => {
            window.history.replaceState(null, "", "/p%61ge/edit/stage");

            render(
                <RouterBrowserRouter>
                    <Routes>
                        <Route path="/:page/edit/*" element={<BlockAdminTabs>{tabs}</BlockAdminTabs>} />
                    </Routes>
                </RouterBrowserRouter>,
            );

            expect(await screen.findByText("Stage: /page/edit/stage /page/edit/stage")).toBeTruthy();
            expect(getSelectedTab()).toBe("Stage tab");
        });
    });

    it("should fall back to the first tab for an unknown tab", () => {
        renderOnEditPage("/page/edit/unknown");

        expect(getSelectedTab()).toBe("Content tab");
        expect(screen.getByText("Content: /page/edit /page/edit")).toBeTruthy();
    });

    it("should navigate to a tab", async () => {
        renderOnEditPage("/page/edit");

        fireEvent.click(screen.getByText("Config tab"));

        expect(await screen.findByText("Config: /page/edit/config /page/edit/config")).toBeTruthy();
        expect(location?.pathname).toBe("/page/edit/config");
        expect(getSelectedTab()).toBe("Config tab");
    });

    it("should build the URLs from the route and not from a sub-route", () => {
        renderOnEditPage(
            "/page/edit/stage",
            <SubRoute path="/page/edit/save">
                <BlockAdminTabs>{tabs}</BlockAdminTabs>
            </SubRoute>,
        );

        expect(screen.getAllByRole("tab").map((tab) => tab.getAttribute("href"))).toEqual(["/page/edit", "/page/edit/stage", "/page/edit/config"]);
        expect(screen.getByText("Stage: /page/edit/stage /page/edit/save")).toBeTruthy();
    });

    it("should support nested tabs", () => {
        const nestedTabs = [
            { key: "general", label: "General tab", content: <TabContent name="General" /> },
            { key: "advanced", label: "Advanced tab", content: <TabContent name="Advanced" /> },
        ];
        renderOnEditPage(
            "/page/edit/config/advanced",
            <BlockAdminTabs>
                {[
                    { key: "content", label: "Content tab", content: <TabContent name="Content" /> },
                    { key: "config", label: "Config tab", content: <BlockAdminTabs>{nestedTabs}</BlockAdminTabs> },
                ]}
            </BlockAdminTabs>,
        );

        expect(screen.getByText("Advanced: /page/edit/config/advanced /page/edit/config/advanced")).toBeTruthy();
        expect(screen.getByText("General tab").closest("a")?.getAttribute("href")).toBe("/page/edit/config");
    });

    it("should reset the tabs when navigating to the tabs of another URL", async () => {
        function TabWithState() {
            const [text, setText] = useState("initial");
            return (
                <>
                    <div>Text: {text}</div>
                    <button onClick={() => setText("changed")}>Change text</button>
                </>
            );
        }

        render(
            <RouterMemoryRouter initialEntries={["/pages/1/edit/stage"]}>
                <Link to="/pages/2/edit/stage">Other page</Link>
                <Routes>
                    <Route
                        path="/pages/:id/edit/*"
                        element={<BlockAdminTabs>{[tabs[0], { key: "stage", label: "Stage tab", content: <TabWithState /> }]}</BlockAdminTabs>}
                    />
                </Routes>
            </RouterMemoryRouter>,
        );
        fireEvent.click(screen.getByText("Change text"));
        expect(screen.getByText("Text: changed")).toBeTruthy();

        fireEvent.click(screen.getByText("Other page"));

        expect(await screen.findByText("Text: initial")).toBeTruthy();
    });

    it("should catch errors of a tab", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        function FailingTab(): never {
            throw new Error("Failing tab");
        }

        renderOnEditPage(
            "/page/edit/stage",
            <BlockAdminTabs>{[tabs[0], { key: "stage", label: "Stage tab", content: <FailingTab /> }]}</BlockAdminTabs>,
        );

        expect(screen.getByText("An error has occurred")).toBeTruthy();

        fireEvent.click(screen.getByText("Content tab"));

        await waitFor(() => {
            expect(screen.queryByText("An error has occurred")).toBeNull();
        });
        expect(screen.getByText("Content: /page/edit /page/edit")).toBeTruthy();

        consoleError.mockRestore();
    });
});
