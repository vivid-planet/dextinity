import type { FormApi, Unsubscribe } from "final-form";

import { focusFirstInvalidField } from "./fieldElements";

/**
 * A form decorator that focuses the first field with an error, in document order, when submitting fails – because of validation errors
 * or because `onSubmit` returned submit errors. Covers the fields of this package.
 *
 * @example
 * ```tsx
 * <Form onSubmit={save} decorators={[focusOnError]}>
 * ```
 */
export function focusOnError<FormValues, InitialFormValues>(form: FormApi<FormValues, InitialFormValues>): Unsubscribe {
    const anyForm = form as unknown as FormApi<object>;
    const originalSubmit = form.submit;
    form.submit = () => {
        const result = originalSubmit.call(form);
        if (result != null) {
            return result.then((submitErrors) => {
                if (form.getState().hasSubmitErrors) {
                    focusFirstInvalidField(anyForm);
                }
                return submitErrors;
            });
        }
        const { hasValidationErrors, hasSubmitErrors } = form.getState();
        if (hasValidationErrors || hasSubmitErrors) {
            focusFirstInvalidField(anyForm);
        }
        return result;
    };
    return () => {
        form.submit = originalSubmit;
    };
}
