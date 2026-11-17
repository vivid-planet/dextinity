import { createTheme } from "@mui/material/styles";
import type { PropsWithChildren, ReactElement } from "react";
import { IntlProvider } from "react-intl";
import { Link, type Location, Route, Routes, useParams, useResolvedPath } from "react-router";
import { cleanup, fireEvent, LocationSpy, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { MainNavigationItemRouterLink } from "../mui/mainNavigation/ItemRouterLink";
import { MuiThemeProvider } from "../mui/ThemeProvider";
import { useSelectionRoute } from "../SelectionRoute";
import { StackPage } from "../stack/Page";
import { Stack } from "../stack/Stack";
import { StackSwitch } from "../stack/Switch";
import { RouterTab, RouterTabs } from "../tabs/RouterTabs";
import { RouterBrowserRouter } from "./BrowserRouter";
import { useCurrentRouteMatch } from "./internal/routeContext";
import { RouterPrompt } from "./Prompt";

type History = "memory" | "browser";

function BrowserRouterWrapper({ children }: PropsWithChildren) {
    return (
        <IntlProvider locale="en">
            <MuiThemeProvider theme={createTheme()}>
                <RouterBrowserRouter>{children}</RouterBrowserRouter>
            </MuiThemeProvider>
        </IntlProvider>
    );
}

function renderAt(history: History, url: string, ui: ReactElement) {
    let currentLocation: Location | undefined;
    const uiWithLocationSpy = (
        <>
            {ui}
            <LocationSpy
                onChange={(location) => {
                    currentLocation = location;
                }}
            />
        </>
    );
    if (history === "browser") {
        window.history.replaceState(null, "", url);
        render(uiWithLocationSpy, { wrapper: BrowserRouterWrapper });
    } else {
        render(
            <IntlProvider locale="en">
                <MuiThemeProvider theme={createTheme()}>{uiWithLocationSpy}</MuiThemeProvider>
            </IntlProvider>,
            { initialEntries: [url] },
        );
    }
    return { getPathname: () => currentLocation?.pathname };
}

function ScopedRoutes({ children }: PropsWithChildren) {
    return (
        <Routes>
            <Route
                path="/:domain/:language/*"
                element={
                    <Routes>
                        <Route path="pages/*" element={children} />
                    </Routes>
                }
            />
        </Routes>
    );
}

function PageInfo({ id }: { id: string }) {
    const params = useParams();
    const resolvedPath = useResolvedPath(".");
    const routeUrl = useCurrentRouteMatch()?.url;
    return (
        <p>
            edit page id={id} param id={params.id} url={routeUrl} resolved={resolvedPath.pathname}
        </p>
    );
}

function DirtyContent({ links }: { links: string[] }) {
    return (
        <RouterPrompt message={() => "Unsaved changes"} subRoutePath="./sub">
            {links.map((link) => (
                <Link key={link} to={link}>
                    {link}
                </Link>
            ))}
        </RouterPrompt>
    );
}

function PagesStack({ editPageChildren }: { editPageChildren?: ReactElement }) {
    return (
        <Stack topLevelTitle="Pages">
            <StackSwitch>
                <StackPage name="list">page list</StackPage>
                <StackPage name="edit">
                    {(id) => (
                        <>
                            <PageInfo id={id} />
                            {editPageChildren}
                        </>
                    )}
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}

// Memory history keeps the URLs of routes decoded, browser history encodes them canonically
const urlsOfPagesRoute: Array<{ history: History; pagesUrl: string; routeUrl: string }> = [
    { history: "memory", pagesUrl: "/%C3%BCber/de/pages", routeUrl: "/über/de/pages" },
    { history: "memory", pagesUrl: "/%c3%bcber/de/pages", routeUrl: "/über/de/pages" },
    { history: "memory", pagesUrl: "/main/d%65/pages", routeUrl: "/main/de/pages" },
    { history: "memory", pagesUrl: "/über/de/pages", routeUrl: "/über/de/pages" },
    { history: "browser", pagesUrl: "/%C3%BCber/de/pages", routeUrl: "/%C3%BCber/de/pages" },
    { history: "browser", pagesUrl: "/%c3%bcber/de/pages", routeUrl: "/%C3%BCber/de/pages" },
    { history: "browser", pagesUrl: "/main/d%65/pages", routeUrl: "/main/de/pages" },
];

describe.each(urlsOfPagesRoute)("at $pagesUrl in $history history", ({ history, pagesUrl, routeUrl }) => {
    afterEach(() => {
        cleanup();
        window.history.replaceState(null, "", "/");
    });

    it("should render the initial page of a StackSwitch", async () => {
        renderAt(
            history,
            pagesUrl,
            <ScopedRoutes>
                <PagesStack />
            </ScopedRoutes>,
        );

        expect(await screen.findByText("page list")).toBeInTheDocument();
    });

    it("should render a page of a StackSwitch with the URL encoded like the URLs of routes", async () => {
        renderAt(
            history,
            `${pagesUrl}/1/edit`,
            <ScopedRoutes>
                <PagesStack />
            </ScopedRoutes>,
        );

        expect(
            await screen.findByText(`edit page id=1 param id=1 url=${routeUrl}/1/edit resolved=${routeUrl}/1/edit`, { exact: false }),
        ).toBeInTheDocument();
        expect(screen.queryByText("page list")).not.toBeInTheDocument();
    });

    it("should pass the decoded id to a page of a StackSwitch", async () => {
        renderAt(
            history,
            `${pagesUrl}/%C3%A4%2525/edit`,
            <ScopedRoutes>
                <PagesStack />
            </ScopedRoutes>,
        );

        expect(await screen.findByText("edit page id=ä%25 param id=ä%25", { exact: false })).toBeInTheDocument();
    });

    it("should render and select the tab of RouterTabs", async () => {
        renderAt(
            history,
            `${pagesUrl}/1/edit/variants`,
            <ScopedRoutes>
                <PagesStack
                    editPageChildren={
                        <RouterTabs>
                            <RouterTab label="Details" path="">
                                details content
                            </RouterTab>
                            <RouterTab label="Variants" path="/variants">
                                variants content
                            </RouterTab>
                        </RouterTabs>
                    }
                />
            </ScopedRoutes>,
        );

        expect(await screen.findByText("variants content")).toBeInTheDocument();
        expect(screen.queryByText("details content")).not.toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "Variants" })).toHaveAttribute("aria-selected", "true");
    });

    it("should select the id of a SelectionRoute", async () => {
        function Selection() {
            const [SelectionRoute, selection] = useSelectionRoute();
            return <SelectionRoute>{selection.id && <p>selected id={selection.id}</p>}</SelectionRoute>;
        }

        renderAt(
            history,
            `${pagesUrl}/%C3%A4`,
            <ScopedRoutes>
                <Selection />
            </ScopedRoutes>,
        );

        expect(await screen.findByText("selected id=ä")).toBeInTheDocument();
    });

    it("should select a MainNavigationItemRouterLink linking to the route", async () => {
        renderAt(
            history,
            `${pagesUrl}/1/edit`,
            <ScopedRoutes>
                <MainNavigationItemRouterLink primary="Pages" to="." />
                <MainNavigationItemRouterLink primary="Other" to="../other" />
            </ScopedRoutes>,
        );

        expect(await screen.findByRole("link", { name: "Pages" })).toHaveClass("Mui-selected");
        expect(screen.getByRole("link", { name: "Other" })).not.toHaveClass("Mui-selected");
    });

    describe("RouterPrompt", () => {
        function renderDirtyEditPage(links: string[]) {
            return renderAt(
                history,
                `${pagesUrl}/1/edit`,
                <ScopedRoutes>
                    <PagesStack editPageChildren={<DirtyContent links={links} />} />
                </ScopedRoutes>,
            );
        }

        it("shouldn't ask when navigating to another URL matching the page's route", async () => {
            const { getPathname } = renderDirtyEditPage([`${pagesUrl}/2/edit`]);

            fireEvent.click(await screen.findByText(`${pagesUrl}/2/edit`));

            expect(await screen.findByText("edit page id=2", { exact: false })).toBeInTheDocument();
            expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
            await waitFor(() => {
                expect(getPathname()?.toLowerCase()).toBe(`${pagesUrl}/2/edit`.toLowerCase());
            });
        });

        it("shouldn't ask when navigating into its sub route", async () => {
            const { getPathname } = renderDirtyEditPage([`${pagesUrl}/1/edit/sub/details`]);

            fireEvent.click(await screen.findByText(`${pagesUrl}/1/edit/sub/details`));

            await waitFor(() => {
                expect(getPathname()?.toLowerCase()).toBe(`${pagesUrl}/1/edit/sub/details`.toLowerCase());
            });
            expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
        });

        it("should ask when leaving the page's route", async () => {
            renderDirtyEditPage([pagesUrl]);

            fireEvent.click(await screen.findByText(pagesUrl));

            expect(await screen.findByText("Unsaved changes")).toBeInTheDocument();
        });
    });
});
