import { Link, Route, Routes } from "react-router";
import { cleanup, fireEvent, render } from "test-utils";
import { afterEach, expect, test, vi } from "vitest";

import { RouteWithErrorBoundary } from "./RouteWithErrorBoundary";

afterEach(cleanup);

test("RouteWithErrorBoundary resets the error when navigating to another route", async () => {
    function BrokenPage(): never {
        throw new Error("broken page");
    }
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const rendered = render(
        <>
            <Link to="/working">working link</Link>
            <Routes>
                <Route
                    path="/broken/*"
                    element={
                        <RouteWithErrorBoundary userErrorMessage="page failed">
                            <BrokenPage />
                        </RouteWithErrorBoundary>
                    }
                />
                <Route
                    path="/working/*"
                    element={
                        <RouteWithErrorBoundary userErrorMessage="page failed">
                            <p>working page</p>
                        </RouteWithErrorBoundary>
                    }
                />
            </Routes>
        </>,
        { initialEntries: ["/broken"] },
    );

    expect(rendered.getByText("page failed")).toBeInTheDocument();

    fireEvent.click(rendered.getByText("working link"));

    expect(await rendered.findByText("working page")).toBeInTheDocument();
    expect(rendered.queryByText("page failed")).not.toBeInTheDocument();
    consoleError.mockRestore();
});
