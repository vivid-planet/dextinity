import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { StackBreadcrumbs } from "../../stack/breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../../stack/Page";
import { Stack } from "../../stack/Stack";
import { StackLink } from "../../stack/StackLink";
import { StackSwitch } from "../../stack/Switch";

export default {
    title: "components/form",
};

export const StackInForm = {
    render: () => {
        return (
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
                    <Stack topLevelTitle="Stack">
                        <StackBreadcrumbs />
                        <StackSwitch>
                            <StackPage name="page1">
                                <Field label="Foo" name="foo" component={FinalFormInput} />
                                <StackLink pageName="page2" payload="xx">
                                    go to page2
                                </StackLink>
                            </StackPage>
                            <StackPage name="page2">
                                <Field label="Bar" name="bar" component={FinalFormInput} />
                            </StackPage>
                        </StackSwitch>
                    </Stack>
                )}
            </FinalForm>
        );
    },

    name: "StackInForm",
};
