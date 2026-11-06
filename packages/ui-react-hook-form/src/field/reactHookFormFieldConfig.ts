import type { ReactNode } from "react";
import type { Control, FieldPath, FieldPathValue, FieldValues, UseControllerProps } from "react-hook-form";

/**
 * The field-level configuration of React Hook Form an adapter passes to `useController`: the form's `control`, validation rules, and the
 * field's default value.
 */
export interface ReactHookFormFieldConfig<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    /** The form's `control` from `useForm`. Defaults to the one of the surrounding `FormProvider`. */
    control?: Control<TFieldValues>;
    /** Validation rules as in `register`, e.g. `{ validate: (value) => … }` or `{ pattern: … }`. Combined with `required`. */
    rules?: UseControllerProps<TFieldValues, TName>["rules"];
    /** The field's value until the form's `defaultValues` or `reset` set one. */
    defaultValue?: FieldPathValue<TFieldValues, TName>;
    /** Removes the field's value from the form values when the adapter unmounts. */
    shouldUnregister?: boolean;
    /**
     * Returns a warning for the field's value, shown as `state="warning"` without blocking submitting, e.g. a text longer than
     * recommended. React Hook Form has no warnings of its own: compute cross-field warnings in the form, e.g. with `useWatch`, and
     * return them here.
     */
    warn?: (value: FieldPathValue<TFieldValues, TName>) => ReactNode;
}
