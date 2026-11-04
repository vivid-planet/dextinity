import { Link, type Location, Navigate, Route, Routes, useNavigate } from "react-router";
import { act, cleanup, fireEvent, LocationSpy, render, waitFor } from "test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { StackPage } from "../stack/Page";
import { Stack } from "../stack/Stack";
import { StackSwitch } from "../stack/Switch";
import { RouterTab, RouterTabs } from "../tabs/RouterTabs";
import { ForcePromptRoute } from "./ForcePromptRoute";
import { RouterPrompt } from "./Prompt";
import type { SaveAction } from "./PromptHandler";
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
                            <Routes>
                                <Route path="s/sub/*" element={<div>sub</div>} />
                            </Routes>
                        </RouterPrompt>
                    }
                />
                <Route path="*" element={<Navigate to="/foo" replace />} />
            </Routes>
        );
    }

    const rendered = render(<Story />);

    fireEvent.click(await rendered.findByText("subLink"));

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
                <Routes>
                    <Route path="s/sub/*" element={<div>sub</div>} />
                </Routes>
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

    fireEvent.click(await rendered.findByText("subLink"));

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
                            <Routes>
                                <Route path="*" element={<div>foo</div>} />
                            </Routes>
                            <Routes>
                                <Route path="s/sub/*" element={<div>sub</div>} />
                            </Routes>
                        </RouterPrompt>
                    }
                />
                <Route path="*" element={<Navigate to="/foo" replace />} />
            </Routes>
        );
    }

    const rendered = render(<Story />);

    fireEvent.click(await rendered.findByText("subLink"));

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
                <Route path="/bar/*" element="bar" />
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
                            <Routes>
                                <Route path="sub1/*" element={<div>sub1</div>} />
                            </Routes>
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

    fireEvent.click(await rendered.findByText("/foo/sub2"));

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

describe("Blocking navigation", () => {
    function DirtyPage({ saveAction, isDirty }: { saveAction: SaveAction; isDirty: () => boolean }) {
        const navigate = useNavigate();
        return (
            <RouterPrompt message={() => (isDirty() ? "Unsaved changes" : true)} saveAction={saveAction} subRoutePath="/form/sub">
                <Link to="/other">otherLink</Link>
                <Link to="/elsewhere">elsewhereLink</Link>
                <Link to="/form/sub/details">subLink</Link>
                <button type="button" onClick={() => navigate("/other")}>
                    navigateButton
                </button>
                <button type="button" onClick={() => navigate(-1)}>
                    backButton
                </button>
            </RouterPrompt>
        );
    }

    function Story({ saveAction, isDirty }: { saveAction: SaveAction; isDirty: () => boolean }) {
        return (
            <Routes>
                <Route path="/form/*" element={<DirtyPage saveAction={saveAction} isDirty={isDirty} />} />
                <Route path="/other/*" element={<div>other page</div>} />
                <Route path="/elsewhere/*" element={<div>elsewhere page</div>} />
            </Routes>
        );
    }

    function renderStory(options: { saveSucceeds?: boolean; saveAction?: SaveAction; isDirty?: () => boolean; initialEntries?: string[] } = {}) {
        const { saveSucceeds = true, saveAction = () => saveSucceeds, isDirty = () => true, initialEntries = ["/form"] } = options;
        let currentLocation: Location | undefined;
        const rendered = render(
            <>
                <Story saveAction={saveAction} isDirty={isDirty} />
                <LocationSpy
                    onChange={(location) => {
                        currentLocation = location;
                    }}
                />
            </>,
            { initialEntries, initialIndex: initialEntries.length - 1 },
        );
        return { rendered, getPathname: () => currentLocation?.pathname };
    }

    test("blocks a Link click and proceeds after discarding", async () => {
        const { rendered, getPathname } = renderStory();

        fireEvent.click(rendered.getByText("otherLink"));

        expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();
        expect(getPathname()).toBe("/form");

        fireEvent.click(rendered.getByText("Discard"));

        expect(await rendered.findByText("other page")).toBeInTheDocument();
        await waitFor(() => {
            expect(getPathname()).toBe("/other");
        });
    });

    test("blocks navigate() and stays after cancelling", async () => {
        const { rendered, getPathname } = renderStory();

        fireEvent.click(rendered.getByText("navigateButton"));

        expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();

        fireEvent.click(rendered.getByRole("button", { name: "" }));

        await waitFor(() => {
            expect(rendered.queryByText("Unsaved changes")).not.toBeInTheDocument();
        });
        expect(rendered.queryByText("other page")).not.toBeInTheDocument();
        expect(getPathname()).toBe("/form");
    });

    test("blocks going back (POP) and proceeds after saving", async () => {
        const { rendered, getPathname } = renderStory({ initialEntries: ["/other", "/form"] });

        fireEvent.click(rendered.getByText("backButton"));

        expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();
        expect(getPathname()).toBe("/form");

        fireEvent.click(rendered.getByText("Save"));

        expect(await rendered.findByText("other page")).toBeInTheDocument();
        await waitFor(() => {
            expect(getPathname()).toBe("/other");
        });
    });

    test("stays when saving fails", async () => {
        const { rendered, getPathname } = renderStory({ saveSucceeds: false });

        fireEvent.click(rendered.getByText("otherLink"));
        expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();

        fireEvent.click(rendered.getByText("Save"));

        await waitFor(() => {
            expect(rendered.queryByText("Unsaved changes")).not.toBeInTheDocument();
        });
        expect(rendered.queryByText("other page")).not.toBeInTheDocument();
        expect(getPathname()).toBe("/form");
    });

    describe("clicking twice while saving", () => {
        const unhandledRejections: unknown[] = [];
        function collectUnhandledRejection(reason: unknown) {
            unhandledRejections.push(reason);
        }

        beforeEach(() => {
            unhandledRejections.length = 0;
            process.on("unhandledRejection", collectUnhandledRejection);
        });

        afterEach(() => {
            process.off("unhandledRejection", collectUnhandledRejection);
        });

        function createSlowSaveAction() {
            return vi.fn(() => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 50)));
        }

        test("saves once and proceeds once when Save is clicked twice", async () => {
            const saveAction = createSlowSaveAction();
            const { rendered, getPathname } = renderStory({ saveAction });

            fireEvent.click(rendered.getByText("otherLink"));
            expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();

            fireEvent.click(rendered.getByText("Save"));
            fireEvent.click(rendered.getByText("Save"));

            expect(await rendered.findByText("other page")).toBeInTheDocument();
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(saveAction).toHaveBeenCalledTimes(1);
            expect(getPathname()).toBe("/other");
            expect(unhandledRejections).toEqual([]);
        });

        test("ignores a Save click after the navigation has been proceeded", async () => {
            const saveAction = vi.fn(async () => true);
            const { rendered, getPathname } = renderStory({ saveAction });

            fireEvent.click(rendered.getByText("otherLink"));
            expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();

            fireEvent.click(rendered.getByText("Save"));
            for (let tick = 0; tick < 10; tick++) {
                await Promise.resolve();
            }
            fireEvent.click(rendered.getByText("Save"));

            expect(await rendered.findByText("other page")).toBeInTheDocument();
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(saveAction).toHaveBeenCalledTimes(1);
            expect(getPathname()).toBe("/other");
            expect(unhandledRejections).toEqual([]);
        });

        test("doesn't proceed after saving when the blocked navigation was superseded", async () => {
            const saveAction = createSlowSaveAction();
            const { rendered, getPathname } = renderStory({ saveAction });

            fireEvent.click(rendered.getByText("otherLink"));
            expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();

            fireEvent.click(rendered.getByText("Save"));
            fireEvent.click(rendered.getByText("subLink"));

            await waitFor(() => {
                expect(rendered.queryByText("Unsaved changes")).not.toBeInTheDocument();
            });
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(saveAction).toHaveBeenCalledTimes(1);
            expect(getPathname()).toBe("/form/sub/details");
            expect(unhandledRejections).toEqual([]);
        });
        test("doesn't proceed to a cancelled navigation when saving finishes while another navigation is blocked", async () => {
            let dirty = true;
            let finishSaving: () => void = () => {};
            const saveAction = vi.fn(
                () =>
                    new Promise<boolean>((resolve) => {
                        finishSaving = () => {
                            dirty = false;
                            resolve(true);
                        };
                    }),
            );
            const { rendered, getPathname } = renderStory({ saveAction, isDirty: () => dirty });

            fireEvent.click(rendered.getByText("otherLink"));
            expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();

            fireEvent.click(rendered.getByText("Save"));
            fireEvent.click(rendered.getByRole("button", { name: "" }));
            await waitFor(() => {
                expect(rendered.queryByText("Unsaved changes")).not.toBeInTheDocument();
            });

            fireEvent.click(rendered.getByText("elsewhereLink"));
            expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();
            await act(async () => {
                finishSaving();
            });
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(saveAction).toHaveBeenCalledTimes(1);
            expect(rendered.queryByText("other page")).not.toBeInTheDocument();
            expect(getPathname()).toBe("/form");
            expect(rendered.queryByText("elsewhere page")).not.toBeInTheDocument();
            expect(unhandledRejections).toEqual([]);
        });
    });

    test("doesn't block navigating inside subRoutePath", async () => {
        const { rendered, getPathname } = renderStory();

        fireEvent.click(rendered.getByText("subLink"));

        await waitFor(() => {
            expect(getPathname()).toBe("/form/sub/details");
        });
        expect(rendered.queryByText("Unsaved changes")).not.toBeInTheDocument();
    });
});

describe("Prompt's own route", () => {
    function DirtyContent({ links }: { links: string[] }) {
        return (
            <RouterPrompt message={() => "Unsaved changes"}>
                {links.map((link) => (
                    <Link key={link} to={link}>
                        {link}
                    </Link>
                ))}
            </RouterPrompt>
        );
    }

    function renderProductStack(initialEntry: string) {
        let currentLocation: Location | undefined;
        const rendered = render(
            <>
                <Routes>
                    <Route
                        path="products/*"
                        element={
                            <Stack topLevelTitle="Products">
                                <StackSwitch>
                                    <StackPage name="list">product list</StackPage>
                                    <StackPage name="edit">
                                        <RouterTabs>
                                            <RouterTab label="Details" path="">
                                                <DirtyContent links={["/products/6/edit", "/products/5/edit/variants"]} />
                                            </RouterTab>
                                            <RouterTab label="Variants" path="/variants">
                                                <DirtyContent links={["/products/6/edit/variants"]} />
                                            </RouterTab>
                                        </RouterTabs>
                                    </StackPage>
                                </StackSwitch>
                            </Stack>
                        }
                    />
                </Routes>
                <LocationSpy
                    onChange={(location) => {
                        currentLocation = location;
                    }}
                />
            </>,
            { initialEntries: [initialEntry] },
        );
        return { rendered, getPathname: () => currentLocation?.pathname };
    }

    test("doesn't ask when navigating to another URL matching the page's route", async () => {
        const { rendered, getPathname } = renderProductStack("/products/5/edit");

        fireEvent.click(rendered.getByText("/products/6/edit"));

        await waitFor(() => {
            expect(getPathname()).toBe("/products/6/edit");
        });
        expect(rendered.queryByText("Unsaved changes")).not.toBeInTheDocument();

        fireEvent.click(rendered.getByText("/products/5/edit/variants"));

        expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();
        expect(getPathname()).toBe("/products/6/edit");
    });

    test("asks when navigating to the same tab of another page, because the tab's route is built from the page's URL", async () => {
        const { rendered, getPathname } = renderProductStack("/products/5/edit/variants");

        fireEvent.click(rendered.getByText("/products/6/edit/variants"));

        expect(await rendered.findByText("Unsaved changes")).toBeInTheDocument();
        expect(getPathname()).toBe("/products/5/edit/variants");
    });
});
