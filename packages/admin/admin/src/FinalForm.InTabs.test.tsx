import { createTheme } from "@mui/material/styles";
import { IntlProvider } from "react-intl";
import { cleanup, fireEvent, render, waitFor } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { FinalForm } from "./FinalForm";
import { Field } from "./form/Field";
import { FinalFormInput } from "./form/FinalFormInput";
import { MuiThemeProvider } from "./mui/ThemeProvider";
import { RouterMemoryRouter } from "./router/MemoryRouter";
import { StackBreadcrumbs } from "./stack/breadcrumbs/StackBreadcrumbs";
import { StackPage } from "./stack/Page";
import { Stack } from "./stack/Stack";
import { StackLink } from "./stack/StackLink";
import { StackSwitch } from "./stack/Switch";
import { RouterTab, RouterTabs } from "./tabs/RouterTabs";

afterEach(cleanup);

test("Form DirtyPrompt for inner Tabs", async () => {
    function Story() {
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
        );
    }

    const rendered = render(
        <IntlProvider locale="en" messages={{}}>
            <MuiThemeProvider theme={createTheme()}>
                <RouterMemoryRouter>
                    <Story />
                </RouterMemoryRouter>
            </MuiThemeProvider>
        </IntlProvider>,
    );
    const input = rendered.container.querySelector(`input[name="foo"]`);
    if (!input) {
        throw new Error("input not found");
    }
    fireEvent.change(input, { target: { value: "xxxx" } });
    fireEvent.click(rendered.getByText("Form 2"));

    await waitFor(() => {
        const dirtyDialog = rendered.queryAllByText("Do you want to save your changes?");
        expect(dirtyDialog.length).toBe(0);
    });
});

test("Form DirtyPrompt for outer Tabs", async () => {
    function Story() {
        return (
            <RouterTabs>
                <RouterTab label="Page 1" path="" forceRender={true}>
                    <FinalForm
                        mode="edit"
                        onSubmit={(values: any) => {
                            alert(JSON.stringify(values));
                        }}
                        initialValues={{
                            foo: "foo",
                        }}
                    >
                        {() => <Field label="Foo" name="foo" component={FinalFormInput} />}
                    </FinalForm>
                </RouterTab>
                <RouterTab label="Page 2" path="/page2" forceRender={true}>
                    xxxx
                </RouterTab>
            </RouterTabs>
        );
    }

    const rendered = render(
        <IntlProvider locale="en" messages={{}}>
            <MuiThemeProvider theme={createTheme()}>
                <RouterMemoryRouter>
                    <Story />
                </RouterMemoryRouter>
            </MuiThemeProvider>
        </IntlProvider>,
    );
    const input = rendered.container.querySelector(`input[name="foo"]`);
    if (!input) {
        throw new Error("input not found");
    }
    fireEvent.change(input, { target: { value: "xxxx" } });
    fireEvent.click(rendered.getByText("Page 2"));

    await waitFor(() => {
        const dirtyDialog = rendered.queryAllByText("Do you want to save your changes?");
        expect(dirtyDialog.length).toBe(2); // 2 because text is shown twice in dialog (title+content)
    });
});

test("Form DirtyPrompt for outer Stack", async () => {
    function Story() {
        return (
            <Stack topLevelTitle="Stack">
                <StackBreadcrumbs />
                <StackSwitch>
                    <StackPage name="page1">
                        page1
                        <StackLink pageName="page2" payload="xx">
                            go to page2
                        </StackLink>
                    </StackPage>
                    <StackPage name="page2">
                        <StackLink pageName="page1" payload="xx">
                            go to page1
                        </StackLink>
                        <FinalForm
                            mode="edit"
                            onSubmit={(values: any) => {
                                alert(JSON.stringify(values));
                            }}
                            initialValues={{
                                foo: "foo",
                            }}
                        >
                            {() => <Field label="Foo" name="foo" component={FinalFormInput} />}
                        </FinalForm>
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    }

    const rendered = render(
        <IntlProvider locale="en" messages={{}}>
            <MuiThemeProvider theme={createTheme()}>
                <RouterMemoryRouter>
                    <Story />
                </RouterMemoryRouter>
            </MuiThemeProvider>
        </IntlProvider>,
    );
    fireEvent.click(rendered.getByText("go to page2"));
    const input = rendered.container.querySelector(`input[name="foo"]`);
    if (!input) {
        throw new Error("input not found");
    }
    fireEvent.change(input, { target: { value: "xxxx" } });
    fireEvent.click(rendered.getByText("go to page1"));

    await waitFor(() => {
        const dirtyDialog = rendered.queryAllByText("Do you want to save your changes?");
        expect(dirtyDialog.length).toBe(2); // 2 because text is shown twice in dialog (title+content)
    });
});

test("Form DirtyPrompt for inner Stack", async () => {
    function Story() {
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
    }

    const rendered = render(
        <IntlProvider locale="en" messages={{}}>
            <MuiThemeProvider theme={createTheme()}>
                <RouterMemoryRouter>
                    <Story />
                </RouterMemoryRouter>
            </MuiThemeProvider>
        </IntlProvider>,
    );
    const input = rendered.container.querySelector(`input[name="foo"]`);
    if (!input) {
        throw new Error("input not found");
    }
    fireEvent.change(input, { target: { value: "xxxx" } });
    fireEvent.click(rendered.getByText("go to page2"));

    await waitFor(() => {
        const dirtyDialog = rendered.queryAllByText("Do you want to save your changes?");
        expect(dirtyDialog.length).toBe(2); // 2 because text is shown twice in dialog (title+content)
    });
});
