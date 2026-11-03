import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router";

import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { StackSwitch, StackSwitchApiContext } from "../Switch";

function Page1() {
    const switchApi = useContext(StackSwitchApiContext);
    return (
        <button
            onClick={(e) => {
                switchApi.activatePage("page2", "test");
            }}
        >
            activate page2
        </button>
    );
}

function Page2() {
    return (
        <Stack topLevelTitle="Stack Nested">
            <StackBreadcrumbs />
            <StackSwitch>
                <StackPage name="page1">
                    <Page1 />
                </StackPage>
                <StackPage name="page2">page2-2</StackPage>
            </StackSwitch>
        </Stack>
    );
}

function Story() {
    return (
        <Stack topLevelTitle="Stack">
            <StackBreadcrumbs />
            <StackSwitch>
                <StackPage name="page1">
                    <Page1 />
                </StackPage>
                <StackPage name="page2">
                    <Page2 />
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}

export default {
    title: "components/stack/StackNested",
};

export const StackNested = () => {
    return (
        <Routes>
            <Route index element={<Navigate to="/foo" replace />} />
            <Route path="/foo/*" element={<Story />} />
        </Routes>
    );
};
