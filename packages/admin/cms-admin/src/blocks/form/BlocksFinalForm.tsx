import { FinalFormContextProvider, type FinalFormContextProviderProps, renderFinalFormChildren } from "@dextinity/admin";
import { type JSX, useEffect, useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { type AnyObject, Form, type FormProps, type FormRenderProps, useForm, useFormState } from "react-final-form";

interface AutoSaveSpyProps<FormValues> {
    onSubmit: FormProps<FormValues>["onSubmit"];
}
function AutosaveSpy<FormValues>({ onSubmit }: AutoSaveSpyProps<FormValues>) {
    const form = useForm<FormValues>();
    const { dirty, values } = useFormState<FormValues>({ subscription: { dirty: true, values: true } });
    const onSubmitRef = useRef(onSubmit);
    const pendingSubmitTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const lastSubmittedValuesRef = useRef<FormValues>(undefined);

    useLayoutEffect(() => {
        onSubmitRef.current = onSubmit;
    });

    useEffect(() => {
        if (!dirty || pendingSubmitTimeoutRef.current !== undefined) {
            return;
        }

        // The timeout isn't cleared on unmount so that a change made right before closing the block is still saved
        pendingSubmitTimeoutRef.current = setTimeout(() => {
            pendingSubmitTimeoutRef.current = undefined;

            const latestValues = form.getState().values;
            // The form stays dirty when the parent doesn't reinitialize it with the submitted values
            if (latestValues === lastSubmittedValuesRef.current) {
                return;
            }
            lastSubmittedValuesRef.current = latestValues;

            flushSync(() => {
                form.submit(); // to show validation errors, form.submit does not update anything
                onSubmitRef.current(latestValues, form); // call passed onSubmit manually, also when validation errors are present
            });
        }, 1);
    }, [dirty, values, form]);

    return null;
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
