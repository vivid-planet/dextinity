import { createTheme } from "@mui/material/styles";
import { IntlProvider } from "react-intl";
import { Link, Route, Routes } from "react-router";
import { cleanup, fireEvent, render, waitFor } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { MuiThemeProvider } from "../mui/ThemeProvider";
import { SubRoute, SubRouteIndexRoute, useSubRoutePrefix } from "../router/SubRoute";

afterEach(cleanup);

test("Subrote other route hidden", async () => {
    function Cmp1() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <Routes>
                <Route path={`${urlPrefix}/sub/*`} element={<div>Cmp1 Sub</div>} />
                <Route
                    path="*"
                    element={
                        <SubRouteIndexRoute>
                            <div>
                                <Link to={`${urlPrefix}/sub`}>Cmp1 SubLink</Link>
                            </div>
                        </SubRouteIndexRoute>
                    }
                />
            </Routes>
        );
    }

    function Cmp2() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <Routes>
                <Route
                    path={`${urlPrefix}/sub/*`}
                    element={
                        <>
                            <div>
                                <Link to={`${urlPrefix}/sub`}>Sub</Link>
                                <br />
                                <Link to={`${urlPrefix}/sub/sub2`}>Sub2</Link>
                            </div>
                            <Routes>
                                <Route path="sub2/*" element={<div>Cmp2 Sub2</div>} />
                                <Route path="*" element={<div>Cmp2 Sub</div>} />
                            </Routes>
                        </>
                    }
                />
                <Route
                    path="*"
                    element={
                        <SubRouteIndexRoute>
                            <div>
                                <Link to={`${urlPrefix}/sub`}>Cmp2 SubLink</Link>
                            </div>
                        </SubRouteIndexRoute>
                    }
                />
            </Routes>
        );
    }

    function Story() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <div>
                <SubRoute path={`${urlPrefix}/cmp1`}>
                    <div>
                        <Cmp1 />
                    </div>
                </SubRoute>
                <SubRoute path={`${urlPrefix}/cmp2`}>
                    <div>
                        <Cmp2 />
                    </div>
                </SubRoute>
            </div>
        );
    }

    const rendered = render(
        <IntlProvider locale="en">
            <MuiThemeProvider theme={createTheme()}>
                <Story />
            </MuiThemeProvider>
        </IntlProvider>,
    );

    fireEvent.click(rendered.getByText("Cmp1 SubLink"));

    await waitFor(() => {
        expect(rendered.getByText("Cmp1 Sub")).toBeInTheDocument();
    });
    expect(rendered.queryByText("Cmp2 SubLink")).not.toBeInTheDocument();
});

test("Subrote other route hidden", async () => {
    function Cmp1() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <Routes>
                <Route path={`${urlPrefix}/sub/*`} element={<div>Cmp1 Sub</div>} />
                <Route
                    path="*"
                    element={
                        <SubRouteIndexRoute>
                            <div>
                                <Link to={`${urlPrefix}/sub`}>Cmp1 SubLink</Link>
                            </div>
                        </SubRouteIndexRoute>
                    }
                />
            </Routes>
        );
    }

    function Cmp2() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <Routes>
                <Route
                    path={`${urlPrefix}/sub/*`}
                    element={
                        <>
                            <div>
                                <Link to={`${urlPrefix}/sub`}>Sub</Link>
                                <br />
                                <Link to={`${urlPrefix}/sub/sub2`}>Sub2</Link>
                            </div>
                            <Routes>
                                <Route path="sub2/*" element={<div>Cmp2 Sub2</div>} />
                                <Route path="*" element={<div>Cmp2 Sub</div>} />
                            </Routes>
                        </>
                    }
                />
                <Route
                    path="*"
                    element={
                        <SubRouteIndexRoute>
                            <div>
                                <Link to={`${urlPrefix}/sub`}>Cmp2 SubLink</Link>
                            </div>
                        </SubRouteIndexRoute>
                    }
                />
            </Routes>
        );
    }

    function Story() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <div>
                <SubRoute path={`${urlPrefix}/cmp1`}>
                    <div>
                        <Cmp1 />
                    </div>
                </SubRoute>
                <SubRoute path={`${urlPrefix}/cmp2`}>
                    <div>
                        <Cmp2 />
                    </div>
                </SubRoute>
            </div>
        );
    }

    const rendered = render(
        <IntlProvider locale="en">
            <MuiThemeProvider theme={createTheme()}>
                <Story />
            </MuiThemeProvider>
        </IntlProvider>,
    );

    fireEvent.click(rendered.getByText("Cmp2 SubLink"));

    await waitFor(() => {
        expect(rendered.getByText("Cmp2 Sub")).toBeInTheDocument();
    });
    expect(rendered.queryByText("Cmp1 SubLink")).not.toBeInTheDocument();
    fireEvent.click(rendered.getByText("Sub2"));

    await waitFor(() => {
        expect(rendered.getByText("Cmp2 Sub2")).toBeInTheDocument();
    });
    expect(rendered.queryByText("Cmp2 Sub")).not.toBeInTheDocument();
});

test("Route below Subroute", async () => {
    function Cmp2() {
        const urlPrefix = useSubRoutePrefix();
        return <div>urlPrefix={urlPrefix}</div>;
    }
    function Cmp1() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <>
                <Link to={`${urlPrefix}/sub`}>Sub</Link>
                <Routes>
                    <Route path={`${urlPrefix}/sub/*`} element={<Cmp2 />} />
                </Routes>
            </>
        );
    }
    function Story() {
        return (
            <SubRoute path="/foo">
                <Cmp1 />
            </SubRoute>
        );
    }

    const rendered = render(
        <IntlProvider locale="en">
            <MuiThemeProvider theme={createTheme()}>
                <Story />
            </MuiThemeProvider>
        </IntlProvider>,
    );

    fireEvent.click(rendered.getByText("Sub"));
    expect(await rendered.findByText("urlPrefix=/foo/sub")).toBeInTheDocument();
});

test("SubRouteIndexRoute nested Switch", async () => {
    function Cmp1() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <Routes>
                <Route path={`${urlPrefix}/cmp1-sub/*`} element={<div>Cmp1 Sub</div>} />
                <Route
                    path="*"
                    element={
                        <SubRouteIndexRoute>
                            <div>
                                <Link to={`${urlPrefix}/cmp1-sub`}>Cmp1 SubLink</Link>
                            </div>
                        </SubRouteIndexRoute>
                    }
                />
            </Routes>
        );
    }

    function Story() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <Routes>
                <Route path={`${urlPrefix}/sub1/*`} element={<div>Sub1</div>} />
                <Route
                    path="*"
                    element={
                        <SubRouteIndexRoute>
                            <Cmp1 />
                        </SubRouteIndexRoute>
                    }
                />
            </Routes>
        );
    }

    const rendered = render(
        <IntlProvider locale="en">
            <MuiThemeProvider theme={createTheme()}>
                <Story />
            </MuiThemeProvider>
        </IntlProvider>,
    );

    fireEvent.click(rendered.getByText("Cmp1 SubLink"));

    await waitFor(() => {
        expect(rendered.getByText("Cmp1 Sub")).toBeInTheDocument();
    });
});
