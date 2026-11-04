import type { JSX } from "react";
import { type AnyObject, Form, type FormProps, FormSpy } from "react-final-form";

function AutosaveSpy() {
    return (
        <FormSpy subscription={{ dirty: true }}>
            {({ form, dirty }) => {
                if (dirty) {
                    // works around endless loop when using setState from inside render
                    setTimeout(() => {
                        form.submit();
                    }, 1);
                }
                return null;
            }}
        </FormSpy>
    );
}
/**
 * @deprecated Use `BlocksFinalForm` instead
 */
export function AutosaveFinalForm<FormValues = AnyObject>(props: FormProps<FormValues>): JSX.Element {
    return <Form {...props} render={renderForm} />;

    function renderForm() {
        return (
            <>
                <AutosaveSpy />
                {props.children}
            </>
        );
    }
}
