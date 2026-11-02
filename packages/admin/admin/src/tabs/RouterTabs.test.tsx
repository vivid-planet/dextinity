import { useEffect } from "react";
import { createTestRouter, fireEvent, render } from "test-utils";
import { expect, test } from "vitest";

import { useCurrentRouteMatch } from "../router/RouteMatch";
import { SubRoute, useSubRoutePrefix } from "../router/SubRoute";
import { StackPage } from "../stack/Page";
import { Stack } from "../stack/Stack";
import { StackSwitch } from "../stack/Switch";
import { RouterTab, RouterTabs } from "./RouterTabs";

test("RouterTabs in SubRoute", async () => {
    function Cmp1() {
        const match = useCurrentRouteMatch();
        return <p>matchUrl={match?.url}</p>;
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

    const router = createTestRouter();

    const rendered = render(<Story />, { router });
    expect(rendered.getByText("foo tab content")).toBeInTheDocument();

    fireEvent.click(rendered.getByText("Bar"));

    expect(rendered.getByText("bar tab content")).toBeInTheDocument();
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

    const router = createTestRouter();

    const rendered = render(<Story />, { router });
    expect(rendered.getByText("FooContent")).toBeInTheDocument();
    expect(mountCountFoo).toBe(1);
    expect(mountCountBar).toBe(1);

    fireEvent.click(rendered.getByText("BarTab"));
    expect(rendered.getByText("BarContent")).toBeInTheDocument();
    expect(mountCountFoo).toBe(1);
    expect(mountCountBar).toBe(1);

    fireEvent.click(rendered.getByText("FooTab"));
    expect(rendered.getByText("FooContent")).toBeInTheDocument();
    expect(mountCountFoo).toBe(1);
    expect(mountCountBar).toBe(1);
});
