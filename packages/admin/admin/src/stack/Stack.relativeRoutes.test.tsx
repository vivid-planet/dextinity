import { useContext } from "react";
import { Link, Route, Routes, useParams } from "react-router";
import { createTestRouter, fireEvent, render, waitFor } from "test-utils";
import { expect, test } from "vitest";

import { useCurrentRouteMatch } from "../router/RouteMatch";
import { StackPage } from "./Page";
import { Stack } from "./Stack";
import { StackSwitch, StackSwitchApiContext } from "./Switch";

function DetailPage() {
    const { id } = useParams();
    const { url } = useCurrentRouteMatch();
    return (
        <div>
            <p>
                detail id={id} url={url}
            </p>
            <Link to="sub">relative link</Link>
            <Routes>
                <Route path="sub" element={<p>sub route of {id}</p>} />
            </Routes>
        </div>
    );
}

function ListPage() {
    const switchApi = useContext(StackSwitchApiContext);
    return <button onClick={() => switchApi.activatePage("detail", "42")}>open detail</button>;
}

function Story() {
    return (
        <Routes>
            <Route
                path="/products/*"
                element={
                    <Stack topLevelTitle="Products">
                        <StackSwitch>
                            <StackPage name="list">
                                <ListPage />
                            </StackPage>
                            <StackPage name="detail">
                                <DetailPage />
                            </StackPage>
                        </StackSwitch>
                    </Stack>
                }
            />
        </Routes>
    );
}

test("StackPage provides a route context for relative routes, links and params", async () => {
    const rendered = render(<Story />, { router: createTestRouter({ initialEntries: ["/products"] }) });

    fireEvent.click(rendered.getByText("open detail"));
    await rendered.findByText("detail id=42 url=/products/42/detail");
    expect(rendered.router.state.location.pathname).toBe("/products/42/detail");

    fireEvent.click(rendered.getByText("relative link"));
    await waitFor(() => {
        expect(rendered.router.state.location.pathname).toBe("/products/42/detail/sub");
    });
    expect(rendered.getByText("sub route of 42")).toBeInTheDocument();

    fireEvent.click(rendered.getByText("relative link"));
    await waitFor(() => {
        expect(rendered.router.state.location.pathname).toBe("/products/42/detail/sub");
    });
    expect(rendered.getByText("sub route of 42")).toBeInTheDocument();
});
