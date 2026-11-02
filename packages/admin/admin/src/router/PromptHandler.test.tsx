import { Link, Navigate, Route, Routes } from "react-router";
import { act, cleanup, createTestRouter, fireEvent, render, waitFor } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { ForcePromptRoute } from "./ForcePromptRoute";
import { RouterPrompt } from "./Prompt";
import { AbsoluteRoute } from "./RouteMatch";
import { useSubRoutePrefix } from "./SubRoute";

afterEach(cleanup);

test("Nested route in Prompt", async () => {
    function Story() {
        return (
            <Routes>
                <Route
                    path="/foo/*"
                    element={
                        <RouterPrompt
                            message={() => {
                                return "sure?";
                            }}
                            subRoutePath="/foo/s"
                        >
                            <Link to="/foo/s/sub">subLink</Link>
                            <AbsoluteRoute path="/foo/s/sub">
                                <div>sub</div>
                            </AbsoluteRoute>
                        </RouterPrompt>
                    }
                />
                <Route path="*" element={<Navigate to="/foo" replace />} />
            </Routes>
        );
    }

    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("subLink"));

    // verify navigation to sub didn't get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub");
        expect(sub.length).toBe(1);
    });
});

test("Nested dynamic route in Prompt", async () => {
    function FooPage() {
        const subRoutePrefix = useSubRoutePrefix();
        return (
            <RouterPrompt
                message={() => {
                    return "sure?";
                }}
                subRoutePath={`${subRoutePrefix}/s`}
            >
                <Link to={`${subRoutePrefix}/s/sub`}>subLink</Link>
                <Link to={`${subRoutePrefix}`}>back</Link>
                <AbsoluteRoute path={`${subRoutePrefix}/s/sub`}>
                    <div>sub</div>
                </AbsoluteRoute>
            </RouterPrompt>
        );
    }
    function Story() {
        return (
            <Routes>
                <Route path="/foo/:param/*" element={<FooPage />} />
                <Route path="*" element={<Navigate to="/foo/paramvalue" replace />} />
            </Routes>
        );
    }

    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("subLink"));

    // verify navigation to sub didn't get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub");
        expect(sub.length).toBe(1);
    });

    fireEvent.click(rendered.getByText("back")); //go back again, navigating to /foo/:param

    // verify navigation to sub didn't get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub");
        expect(sub.length).toBe(0);
    });
});

test("Nested route with non-sub-path route in Prompt", async () => {
    function Story() {
        return (
            <Routes>
                <Route
                    path="/foo/*"
                    element={
                        <RouterPrompt
                            message={() => {
                                return "sure?";
                            }}
                            subRoutePath="/foo/s"
                        >
                            <Link to="/foo/s/sub">subLink</Link>
                            <Link to="/foo">fooLink</Link>
                            <AbsoluteRoute path="/foo">
                                <div>foo</div>
                            </AbsoluteRoute>
                            <AbsoluteRoute path="/foo/s/sub">
                                <div>sub</div>
                            </AbsoluteRoute>
                        </RouterPrompt>
                    }
                />
                <Route path="*" element={<Navigate to="/foo" replace />} />
            </Routes>
        );
    }

    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("subLink"));

    // verify navigation to /foo/sub didn't get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub");
        expect(sub.length).toBe(1);
    });

    fireEvent.click(rendered.getByText("fooLink"));

    // verify navigation back to /foo didn't get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub");
        expect(sub.length).toBe(0);
    });
});

test("route outside Prompt", async () => {
    function Story() {
        return (
            <Routes>
                <Route
                    path="/"
                    element={
                        <RouterPrompt
                            message={() => {
                                return "sure?";
                            }}
                            subRoutePath="/s"
                        >
                            <Link to="/bar">barLink</Link>
                        </RouterPrompt>
                    }
                />
                <Route path="/bar" element="bar" />
            </Routes>
        );
    }

    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("barLink"));

    // verify navigation to bar did get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("bar");
        expect(sub.length).toBe(0);
    });

    // and dirty dialog is shown
    await waitFor(() => {
        const sub = rendered.queryAllByText("sure?");
        expect(sub.length).toBe(1);
    });
});

test("ForcePromptRoute", async () => {
    function Story() {
        return (
            <Routes>
                <Route
                    path="/foo/*"
                    element={
                        <RouterPrompt
                            message={() => {
                                return "sure?";
                            }}
                            subRoutePath="/foo"
                        >
                            <ul>
                                <li>
                                    <Link to="/foo/sub1">/foo/sub1</Link> (no prompt)
                                </li>
                                <li>
                                    <Link to="/foo/sub2">/foo/sub2</Link> (force prompt)
                                </li>
                                <li>
                                    <Link to="/foo">/foo</Link> (back)
                                </li>
                            </ul>
                            <AbsoluteRoute path="/foo/sub1">
                                <div>sub1</div>
                            </AbsoluteRoute>
                            <ForcePromptRoute path="/foo/sub2">
                                <div>sub2</div>
                            </ForcePromptRoute>
                        </RouterPrompt>
                    }
                />
                <Route path="*" element={<Navigate to="/foo" replace />} />
            </Routes>
        );
    }
    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("/foo/sub2"));

    // verify navigation to bar did get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub2");
        expect(sub.length).toBe(0);
    });

    // and dirty dialog is shown
    await waitFor(() => {
        const sub = rendered.queryAllByText("sure?");
        expect(sub.length).toBe(1);
    });

    fireEvent.click(rendered.getByText("/foo/sub1"));

    // verify navigation didn't get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub");
        expect(sub.length).toBe(0);
    });
});

test("Discard in dirty dialog continues the blocked navigation", async () => {
    let resetActionCalled = false;
    function Story() {
        return (
            <Routes>
                <Route
                    path="/"
                    element={
                        <RouterPrompt
                            message={() => "sure?"}
                            resetAction={() => {
                                resetActionCalled = true;
                            }}
                        >
                            <Link to="/bar">barLink</Link>
                        </RouterPrompt>
                    }
                />
                <Route path="/bar" element="bar" />
            </Routes>
        );
    }

    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("barLink"));
    await rendered.findByText("sure?");
    expect(rendered.router.state.location.pathname).toBe("/");

    fireEvent.click(rendered.getByText("Discard"));

    await waitFor(() => {
        expect(rendered.router.state.location.pathname).toBe("/bar");
    });
    expect(rendered.getByText("bar")).toBeInTheDocument();
    expect(resetActionCalled).toBe(true);
});

test("Cancel in dirty dialog stays on the current page", async () => {
    function Story() {
        return (
            <Routes>
                <Route
                    path="/"
                    element={
                        <RouterPrompt message={() => "sure?"}>
                            <Link to="/bar">barLink</Link>
                        </RouterPrompt>
                    }
                />
                <Route path="/bar" element="bar" />
            </Routes>
        );
    }

    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("barLink"));
    await rendered.findByText("sure?");

    fireEvent.keyDown(rendered.getByRole("dialog"), { key: "Escape" });

    await waitFor(() => {
        expect(rendered.queryByText("sure?")).not.toBeInTheDocument();
    });
    expect(rendered.router.state.location.pathname).toBe("/");
    expect(rendered.queryByText("bar")).not.toBeInTheDocument();
});

test("Back navigation is blocked by Prompt", async () => {
    function Story() {
        return (
            <Routes>
                <Route path="/" element="start" />
                <Route
                    path="/foo"
                    element={
                        <RouterPrompt message={() => "sure?"}>
                            <div>foo</div>
                        </RouterPrompt>
                    }
                />
            </Routes>
        );
    }

    const rendered = render(<Story />, { router: createTestRouter({ initialEntries: ["/", "/foo"], initialIndex: 1 }) });
    expect(rendered.getByText("foo")).toBeInTheDocument();

    await act(() => rendered.router.navigate(-1));

    await rendered.findByText("sure?");
    expect(rendered.router.state.location.pathname).toBe("/foo");
});
