import { Link } from "react-router";
import { cleanup, fireEvent, render, waitFor } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { AbsoluteRoutes } from "./AbsoluteRoutes";
import { AbsoluteRoute } from "./RouteMatch";
import { SubRoute, SubRouteIndexRoute, useSubRoutePrefix } from "./SubRoute";

afterEach(cleanup);

test("Subrote other route hidden", async () => {
    function Cmp1() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <AbsoluteRoutes>
                <AbsoluteRoute path={`${urlPrefix}/sub`}>
                    <div>Cmp1 Sub</div>
                </AbsoluteRoute>
                <SubRouteIndexRoute>
                    <div>
                        <Link to={`${urlPrefix}/sub`}>Cmp1 SubLink</Link>
                    </div>
                </SubRouteIndexRoute>
            </AbsoluteRoutes>
        );
    }

    function Cmp2() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <AbsoluteRoutes>
                <AbsoluteRoute path={`${urlPrefix}/sub`}>
                    <div>
                        <Link to={`${urlPrefix}/sub`}>Sub</Link>
                        <br />
                        <Link to={`${urlPrefix}/sub/sub2`}>Sub2</Link>
                    </div>
                    <AbsoluteRoutes>
                        <AbsoluteRoute path={`${urlPrefix}/sub/sub2`}>
                            <div>Cmp2 Sub2</div>
                        </AbsoluteRoute>
                        <AbsoluteRoute path={`${urlPrefix}/sub`}>
                            <div>Cmp2 Sub</div>
                        </AbsoluteRoute>
                    </AbsoluteRoutes>
                </AbsoluteRoute>
                <SubRouteIndexRoute>
                    <div>
                        <Link to={`${urlPrefix}/sub`}>Cmp2 SubLink</Link>
                    </div>
                </SubRouteIndexRoute>
            </AbsoluteRoutes>
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

    const rendered = render(<Story />);

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
            <AbsoluteRoutes>
                <AbsoluteRoute path={`${urlPrefix}/sub`}>
                    <div>Cmp1 Sub</div>
                </AbsoluteRoute>
                <SubRouteIndexRoute>
                    <div>
                        <Link to={`${urlPrefix}/sub`}>Cmp1 SubLink</Link>
                    </div>
                </SubRouteIndexRoute>
            </AbsoluteRoutes>
        );
    }

    function Cmp2() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <AbsoluteRoutes>
                <AbsoluteRoute path={`${urlPrefix}/sub`}>
                    <div>
                        <Link to={`${urlPrefix}/sub`}>Sub</Link>
                        <br />
                        <Link to={`${urlPrefix}/sub/sub2`}>Sub2</Link>
                    </div>
                    <AbsoluteRoutes>
                        <AbsoluteRoute path={`${urlPrefix}/sub/sub2`}>
                            <div>Cmp2 Sub2</div>
                        </AbsoluteRoute>
                        <AbsoluteRoute path={`${urlPrefix}/sub`}>
                            <div>Cmp2 Sub</div>
                        </AbsoluteRoute>
                    </AbsoluteRoutes>
                </AbsoluteRoute>
                <SubRouteIndexRoute>
                    <div>
                        <Link to={`${urlPrefix}/sub`}>Cmp2 SubLink</Link>
                    </div>
                </SubRouteIndexRoute>
            </AbsoluteRoutes>
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

    const rendered = render(<Story />);

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
                <AbsoluteRoute path={`${urlPrefix}/sub`}>
                    <Cmp2 />
                </AbsoluteRoute>
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

    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("Sub"));
    expect(rendered.getByText("urlPrefix=/foo/sub")).toBeInTheDocument();
});

test("SubRouteIndexRoute nested Switch", async () => {
    function Cmp1() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <AbsoluteRoutes>
                <AbsoluteRoute path={`${urlPrefix}/cmp1-sub`}>
                    <div>Cmp1 Sub</div>
                </AbsoluteRoute>
                <SubRouteIndexRoute>
                    <div>
                        <Link to={`${urlPrefix}/cmp1-sub`}>Cmp1 SubLink</Link>
                    </div>
                </SubRouteIndexRoute>
            </AbsoluteRoutes>
        );
    }

    function Story() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <AbsoluteRoutes>
                <AbsoluteRoute path={`${urlPrefix}/sub1`}>
                    <div>Sub1</div>
                </AbsoluteRoute>
                <SubRouteIndexRoute>
                    <Cmp1 />
                </SubRouteIndexRoute>
            </AbsoluteRoutes>
        );
    }

    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("Cmp1 SubLink"));

    await waitFor(() => {
        expect(rendered.getByText("Cmp1 Sub")).toBeInTheDocument();
    });
});
