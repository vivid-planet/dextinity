import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";

import { SubRoute, useSubRoutePrefix } from "../../router/SubRoute";
import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { StackLink } from "../StackLink";
import { StackSwitch } from "../Switch";

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
                            activate page2
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
                            activate page2
                        </StackLink>
                    </StackPage>
                    <StackPage name="page2">Second Page2</StackPage>
                </StackSwitch>
            </SubRoute>
        </Stack>
    );
}

function Path() {
    const location = useLocation();
    const [, rerender] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => {
            rerender(new Date().getTime());
        }, 100);
        return () => clearTimeout(timer);
    }, []);
    return <div>{location.pathname}</div>;
}

export default {
    title: "components/stack/StackNestedOneStack",
};

export const StackNestedOneStack = {
    render: () => {
        return (
            <>
                <Path />
                <Routes>
                    <Route path="/" element={<Navigate to="/foo" replace />} />
                    <Route path="/foo/*" element={<Story />} />
                </Routes>
            </>
        );
    },

    name: "Stack Nested one Stack",
};
