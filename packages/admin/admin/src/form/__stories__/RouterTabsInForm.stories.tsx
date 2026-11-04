import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
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

export const RouterTabsInForm = {
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
                            </RouterTab>
                        </RouterTabs>
                    )}
                </FinalForm>
            </>
        );
    },

    name: "RouterTabsInForm",
};
