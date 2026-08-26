import { FinalFormContextProvider, type FinalFormContextProviderProps, renderFinalFormChildren } from "@dextinity/admin";
import type { JSX } from "react";
import { flushSync } from "react-dom";
import { type AnyObject, Form, type FormProps, type FormRenderProps, FormSpy } from "react-final-form";

interface AutoSaveSpyProps<FormValues> {
    onSubmit: FormProps<FormValues>["onSubmit"];
}
function AutosaveSpy<FormValues>({ onSubmit }: AutoSaveSpyProps<FormValues>) {
    return (
        <FormSpy<FormValues> subscription={{ dirty: true }}>
            {({ form, dirty }) => {
                if (dirty) {
                    // works around endless loop when using setState from inside render
                    setTimeout(() => {
                        flushSync(() => {
                            form.submit(); // to show validation errors, form.submit does not update anything
                            onSubmit(form.getState().values, form); // call passed onSubmit manually, also when validation errors are present
                        });
                    }, 1);
                }
                return null;
            }}
        </FormSpy>
    );
}

const noop = () => {
    /// nothing
};

const finalFormContextValues: Omit<FinalFormContextProviderProps, "children"> = {
    shouldShowFieldError: (fieldMeta) => fieldMeta.error || fieldMeta.submitError, // Doesnt matter if touched or not
    shouldShowFieldWarning: (fieldMeta) => fieldMeta.data?.warning,
    shouldScrollToField: (fieldMeta) => fieldMeta.error && !fieldMeta.touched, // If a field is not touched yet and has an error we scroll to it
};

export function BlocksFinalForm<FormValues = AnyObject>({ onSubmit, children, ...rest }: FormProps<FormValues>): JSX.Element {
    return <Form {...rest} render={renderForm} onSubmit={noop} />;

    function renderForm(props: FormRenderProps<FormValues, Partial<FormValues>>) {
        return (
            <>
                <AutosaveSpy<FormValues> onSubmit={onSubmit} />
                <FinalFormContextProvider {...finalFormContextValues}>
                    {renderFinalFormChildren(
                        {
                            children: children,
                            component: rest.component,
                            render: rest.render,
                        },
                        props,
                    )}
                </FinalFormContextProvider>
            </>
        );
    }
}
