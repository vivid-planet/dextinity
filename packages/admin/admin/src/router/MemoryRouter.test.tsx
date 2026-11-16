import { Link, type Location, Route, Routes, useResolvedPath } from "react-router";
import { cleanup, fireEvent, LocationSpy, render, waitFor } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ErrorBoundary } from "../error/errorboundary/ErrorBoundary";
import { RouterMemoryRouter } from "./MemoryRouter";
import { RouterPrompt } from "./Prompt";
import { SubRoute, useSubRoutePrefix } from "./SubRoute";

afterEach(cleanup);

describe("RouterMemoryRouter nested in another router", () => {
    function renderNestedRouterStory({ outerPromptMessage, innerPromptMessage }: { outerPromptMessage?: string; innerPromptMessage?: string }) {
        const locations: { outer?: Location; inner?: Location } = {};

        const innerContent = (
            <>
                <LocationSpy
                    onChange={(location) => {
                        locations.inner = location;
                    }}
                />
                <Link to="/inner-page">innerLink</Link>
                <Routes>
                    <Route path="/inner-page/*" element={<div>inner page</div>} />
                </Routes>
            </>
        );

        const outerContent = (
            <>
                <LocationSpy
                    onChange={(location) => {
                        locations.outer = location;
                    }}
                />
                <Link to="/outer-page">outerLink</Link>
                <Routes>
                    <Route path="/outer-page/*" element={<div>outer page</div>} />
                </Routes>
                <RouterMemoryRouter initialEntries={["/inner-start"]}>
                    {innerPromptMessage ? <RouterPrompt message={() => innerPromptMessage}>{innerContent}</RouterPrompt> : innerContent}
                </RouterMemoryRouter>
            </>
        );

        const rendered = render(outerPromptMessage ? <RouterPrompt message={() => outerPromptMessage}>{outerContent}</RouterPrompt> : outerContent, {
            initialEntries: ["/outer-start"],
        });

        return { rendered, locations };
    }

    test("navigates independently of the outer router", async () => {
        const { rendered, locations } = renderNestedRouterStory({});

        expect(locations.outer?.pathname).toBe("/outer-start");
        expect(locations.inner?.pathname).toBe("/inner-start");

        fireEvent.click(rendered.getByText("innerLink"));

        expect(await rendered.findByText("inner page")).toBeInTheDocument();
        expect(locations.inner?.pathname).toBe("/inner-page");
        expect(locations.outer?.pathname).toBe("/outer-start");

        fireEvent.click(rendered.getByText("outerLink"));

        expect(await rendered.findByText("outer page")).toBeInTheDocument();
        expect(locations.outer?.pathname).toBe("/outer-page");
        expect(locations.inner?.pathname).toBe("/inner-page");
    });

    test("a RouterPrompt in the outer router only blocks the outer router", async () => {
        const { rendered, locations } = renderNestedRouterStory({ outerPromptMessage: "outer unsaved" });

        fireEvent.click(rendered.getByText("innerLink"));

        expect(await rendered.findByText("inner page")).toBeInTheDocument();
        expect(rendered.queryByText("outer unsaved")).not.toBeInTheDocument();

        fireEvent.click(rendered.getByText("outerLink"));

        expect(await rendered.findByText("outer unsaved")).toBeInTheDocument();
        expect(rendered.queryByText("outer page")).not.toBeInTheDocument();
        expect(locations.outer?.pathname).toBe("/outer-start");
    });

    test("a RouterPrompt in the nested router only blocks the nested router", async () => {
        const { rendered, locations } = renderNestedRouterStory({ innerPromptMessage: "inner unsaved" });

        fireEvent.click(rendered.getByText("outerLink"));

        expect(await rendered.findByText("outer page")).toBeInTheDocument();
        expect(rendered.queryByText("inner unsaved")).not.toBeInTheDocument();

        fireEvent.click(rendered.getByText("innerLink"));

        expect(await rendered.findByText("inner unsaved")).toBeInTheDocument();
        expect(rendered.queryByText("inner page")).not.toBeInTheDocument();
        expect(locations.inner?.pathname).toBe("/inner-start");

        fireEvent.click(rendered.getByText("Discard"));

        expect(await rendered.findByText("inner page")).toBeInTheDocument();
        await waitFor(() => {
            expect(locations.inner?.pathname).toBe("/inner-page");
        });
        expect(locations.outer?.pathname).toBe("/outer-page");
    });

    test("doesn't inherit routes and sub routes of the outer router", () => {
        function Prefixes({ name }: { name: string }) {
            const subRoutePrefix = useSubRoutePrefix();
            const resolvedPath = useResolvedPath(".");
            return (
                <p>
                    {name}: prefix={subRoutePrefix} resolved={resolvedPath.pathname}
                </p>
            );
        }

        const rendered = render(
            <Routes>
                <Route
                    path="/outer/*"
                    element={
                        <SubRoute path="/outer/sub">
                            <Prefixes name="outer" />
                            <RouterMemoryRouter initialEntries={["/inner"]}>
                                <Prefixes name="inner" />
                            </RouterMemoryRouter>
                        </SubRoute>
                    }
                />
            </Routes>,
            { initialEntries: ["/outer"] },
        );

        expect(rendered.getByText("outer: prefix=/outer/sub resolved=/outer")).toBeInTheDocument();
        expect(rendered.getByText("inner: prefix= resolved=/inner")).toBeInTheDocument();
    });
});

test("render errors propagate to error boundaries outside of the router", () => {
    function BrokenPage(): never {
        throw new Error("broken page");
    }
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const rendered = render(
        <ErrorBoundary userErrorMessage="outer error boundary">
            <RouterMemoryRouter>
                <BrokenPage />
            </RouterMemoryRouter>
        </ErrorBoundary>,
    );

    expect(rendered.getByText("outer error boundary")).toBeInTheDocument();
    consoleError.mockRestore();
});
