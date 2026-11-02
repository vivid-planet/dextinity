import { createTestRouter, fireEvent, render, waitFor } from "test-utils";
import { expect, test } from "vitest";

import { SubRoute, useSubRoutePrefix } from "../router/SubRoute";
import { StackBreadcrumbs } from "./breadcrumbs/StackBreadcrumbs";
import { StackPage } from "./Page";
import { Stack } from "./Stack";
import { StackLink } from "./StackLink";
import { StackSwitch } from "./Switch";

test("multiple stacks on same page", async () => {
    function Story() {
        const urlPrefix = useSubRoutePrefix();
        return (
            <Stack topLevelTitle="Stack">
                <StackBreadcrumbs />
                <SubRoute path={`${urlPrefix}/first`}>
                    <StackSwitch>
                        <StackPage name="page1">
                            <p>First Page1</p>
                            <StackLink pageName="page2" payload="test">
                                activate First Page2
                            </StackLink>
                        </StackPage>
                        <StackPage name="page2">First Page2</StackPage>
                    </StackSwitch>
                </SubRoute>
                <SubRoute path={`${urlPrefix}/second`}>
                    <StackSwitch>
                        <StackPage name="page1">
                            <p>Second Page1</p>
                            <StackLink pageName="page2" payload="test">
                                activate Second Page2
                            </StackLink>
                        </StackPage>
                        <StackPage name="page2">Second Page2</StackPage>
                    </StackSwitch>
                </SubRoute>
            </Stack>
        );
    }

    const router = createTestRouter();

    const rendered = render(<Story />, { router });

    fireEvent.click(rendered.getByText("activate First Page2"));

    await waitFor(() => {
        expect(rendered.getByText("First Page2")).toBeInTheDocument();
    });
    expect(rendered.queryByText("Second Page1")).not.toBeInTheDocument();
    expect(rendered.queryByText("Second Page2")).not.toBeInTheDocument();
});
