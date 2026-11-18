import { createTheme } from "@mui/material/styles";
import { useEffect } from "react";
import { IntlProvider } from "react-intl";
import { Link, Route, Routes, useParams, useResolvedPath } from "react-router";
import { cleanup, fireEvent, render, waitFor } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { MuiThemeProvider } from "../mui/ThemeProvider";
import { useCurrentRouteMatch } from "../router/internal/routeContext";
import { SubRoute, useSubRoutePrefix } from "../router/SubRoute";
import { StackPage } from "../stack/Page";
import { Stack } from "../stack/Stack";
import { StackSwitch } from "../stack/Switch";
import { RouterTab, RouterTabs } from "./RouterTabs";

afterEach(cleanup);

test("RouterTabs in SubRoute", async () => {
    function Cmp1() {
        const resolvedPath = useResolvedPath(".");
        return <p>matchUrl={resolvedPath.pathname}</p>;
    }
    function Story() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <SubRoute path={`${urlPrefix}/sub`}>
                <RouterTabs>
                    <RouterTab label="Foo" path="">
                        <p>foo tab content</p>
                    </RouterTab>
                    <RouterTab label="Bar" path="/bar">
                        <p>bar tab content</p>
                        <Cmp1 />
                    </RouterTab>
                </RouterTabs>
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
    expect(rendered.getByText("foo tab content")).toBeInTheDocument();

    fireEvent.click(rendered.getByText("Bar"));

    expect(await rendered.findByText("bar tab content")).toBeInTheDocument();
    expect(rendered.getByText("matchUrl=/sub/bar")).toBeInTheDocument();
});

test("RouterTabs must not remount content", async () => {
    let mountCountFoo = 0;
    function MountCountFoo() {
        useEffect(() => {
            mountCountFoo++;
        });
        return null;
    }

    let mountCountBar = 0;
    function MountCountBar() {
        useEffect(() => {
            mountCountBar++;
        });
        return null;
    }

    function Story() {
        return (
            <Stack topLevelTitle="Nested Stack">
                <StackSwitch>
                    <StackPage name="xxx">
                        <RouterTabs>
                            <RouterTab label="FooTab" path="" forceRender={true}>
                                FooContent
                                <MountCountFoo />
                            </RouterTab>
                            <RouterTab label="BarTab" path="/bar" forceRender={true}>
                                BarContent
                                <MountCountBar />
                            </RouterTab>
                        </RouterTabs>
                    </StackPage>
                    <StackPage name="yyy">yyy</StackPage>
                </StackSwitch>
            </Stack>
        );
    }

    const rendered = render(
        <IntlProvider locale="en">
            <MuiThemeProvider theme={createTheme()}>
                <Story />
            </MuiThemeProvider>
        </IntlProvider>,
    );
    expect(rendered.getByText("FooContent")).toBeInTheDocument();
    expect(mountCountFoo).toBe(1);
    expect(mountCountBar).toBe(1);

    fireEvent.click(rendered.getByText("BarTab"));
    await waitFor(() => {
        expect(rendered.getByRole("tab", { name: "BarTab" })).toHaveAttribute("aria-selected", "true");
    });
    expect(rendered.getByText("BarContent")).toBeInTheDocument();
    expect(mountCountFoo).toBe(1);
    expect(mountCountBar).toBe(1);

    fireEvent.click(rendered.getByText("FooTab"));
    await waitFor(() => {
        expect(rendered.getByRole("tab", { name: "FooTab" })).toHaveAttribute("aria-selected", "true");
    });
    expect(rendered.getByText("FooContent")).toBeInTheDocument();
    expect(mountCountFoo).toBe(1);
    expect(mountCountBar).toBe(1);
});

test("native routes inside a RouterTab are relative to the tab", async () => {
    function Variant() {
        const { productId, variantId } = useParams();
        const resolvedPath = useResolvedPath(".");
        return (
            <p>
                product={productId} variant={variantId} url={resolvedPath.pathname}
            </p>
        );
    }

    function ProductTabs() {
        return (
            <RouterTabs>
                <RouterTab label="Details" path="">
                    details tab content
                </RouterTab>
                <RouterTab label="Variants" path="/variants">
                    <Link to="7">variant link</Link>
                    <Routes>
                        <Route path=":variantId/*" element={<Variant />} />
                    </Routes>
                </RouterTab>
            </RouterTabs>
        );
    }

    const rendered = render(
        <Routes>
            <Route path="products/:productId/*" element={<ProductTabs />} />
        </Routes>,
        { initialEntries: ["/products/5"] },
    );

    expect(rendered.getByText("details tab content")).toBeInTheDocument();

    fireEvent.click(rendered.getByText("Variants"));

    expect(await rendered.findByText("variant link")).toHaveAttribute("href", "/products/5/variants/7");

    fireEvent.click(rendered.getByText("variant link"));

    expect(await rendered.findByText("product=5 variant=7 url=/products/5/variants/7")).toBeInTheDocument();
});

test("hidden tabs only see a route match if they match", async () => {
    function MatchInfo({ name }: { name: string }) {
        const routeMatch = useCurrentRouteMatch();
        const subRoutePrefix = useSubRoutePrefix();
        return (
            <p>
                {name}: match={routeMatch?.url ?? "none"} prefix={subRoutePrefix}
            </p>
        );
    }

    const rendered = render(
        <RouterTabs>
            <RouterTab label="Foo" path="" forceRender>
                <MatchInfo name="foo" />
            </RouterTab>
            <RouterTab label="Bar" path="/bar" forceRender>
                <MatchInfo name="bar" />
            </RouterTab>
        </RouterTabs>,
    );

    expect(rendered.getByText("foo: match=/ prefix=")).toBeInTheDocument();
    expect(rendered.getByText("bar: match=none prefix=")).toBeInTheDocument();

    fireEvent.click(rendered.getByText("Bar"));

    expect(await rendered.findByText("bar: match=/bar prefix=/bar")).toBeInTheDocument();
    expect(rendered.getByText("foo: match=/ prefix=")).toBeInTheDocument();
});
