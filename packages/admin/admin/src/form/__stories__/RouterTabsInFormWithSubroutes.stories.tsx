import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { Button } from "../../common/buttons/Button";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { StackPage } from "../../stack/Page";
import { Stack } from "../../stack/Stack";
import { StackLink } from "../../stack/StackLink";
import { StackSwitch } from "../../stack/Switch";
import { RouterTab, RouterTabs } from "../../tabs/RouterTabs";

function Path() {
    const location = useLocation();
    const [, rerender] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => {
            rerender(new Date().getTime());
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    return <div>{location.pathname}</div>;
}

export default {
    title: "components/form",
};

export const RouterTabsInFormWithSubroutes = {
    render: () => {
        return (
            <>
                <Path />
                <FinalForm
                    mode="edit"
                    onSubmit={(values: any) => {
                        alert(JSON.stringify(values));
                    }}
                    initialValues={{
                        foo: "foo",
                        bar: "bar",
                    }}
                >
                    {() => (
                        <RouterTabs>
                            <RouterTab label="Form 1" path="" forceRender={true}>
                                <Field label="Foo" name="foo" component={FinalFormInput} />
                            </RouterTab>
                            <RouterTab label="Form 2" path="/form2" forceRender={true}>
                                <Field label="Bar" name="bar" component={FinalFormInput} />
                                <Stack topLevelTitle="">
                                    <StackSwitch initialPage="page1">
                                        <StackPage name="page1">
                                            Form 2 Subpage 1
                                            <StackLink pageName="page2" payload="test">
                                                <Button>To subpage 2</Button>
                                            </StackLink>
                                        </StackPage>
                                        <StackPage name="page2">Form 2 Subpage 2</StackPage>
                                    </StackSwitch>
                                </Stack>
                            </RouterTab>
                        </RouterTabs>
                    )}
                </FinalForm>
            </>
        );
    },

    name: "RouterTabsInFormWithSubroutes",
};
