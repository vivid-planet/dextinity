import { Fragment, StrictMode } from "react";
import { Link } from "react-router";
import { cleanup, fireEvent, render, waitFor } from "test-utils";
import { afterEach, expect, test, vi } from "vitest";

import { RouterBrowserRouter } from "./BrowserRouter";

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
});

test("disposes every router it creates in StrictMode", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const countPopStateListeners = (spy: typeof addEventListener) => spy.mock.calls.filter(([type]) => type === "popstate").length;

    const rendered = render(
        <StrictMode>
            <RouterBrowserRouter>
                <Link to="/next">next</Link>
            </RouterBrowserRouter>
        </StrictMode>,
        { wrapper: Fragment },
    );
    expect(rendered.getByText("next")).toBeInTheDocument();

    rendered.unmount();

    expect(countPopStateListeners(addEventListener)).toBeGreaterThan(0);
    expect(countPopStateListeners(removeEventListener)).toBe(countPopStateListeners(addEventListener));
});

test("navigates in StrictMode", async () => {
    const rendered = render(
        <StrictMode>
            <RouterBrowserRouter>
                <Link to="/next">next</Link>
            </RouterBrowserRouter>
        </StrictMode>,
        { wrapper: Fragment },
    );

    fireEvent.click(rendered.getByText("next"));

    await waitFor(() => {
        expect(window.location.pathname).toBe("/next");
    });
});
