import { type ReactNode, type Ref, useEffect, useMemo } from "react";
import {
    type Control,
    type ControllerRenderProps,
    type FieldPath,
    type FieldValues,
    get,
    set,
    useController,
    type UseControllerProps,
    useFormContext,
    type Validate,
} from "react-hook-form";

import { useFieldAdapterConfig } from "../fieldAdapterConfig/FieldAdapterConfigProvider";
import { mergeRefs } from "../utils/mergeRefs";
import { fieldValidationProps } from "./fieldValidationProps";
import { focusTarget } from "./focusTarget";
import type { ReactHookFormFieldConfig } from "./reactHookFormFieldConfig";

const defaultRequiredMessage = "Required";
const requiredRuleKey = "required";

export function isEmptyValue(value: unknown) {
    return value === undefined || value === null || value === "" || value === false || (Array.isArray(value) && value.length === 0);
}

// Only into an object the default values already have: a row added to a field array has no default values, and creating them for
// its fields would leave the form dirty after the row was removed again
function setMissingDefaultValue(defaultValues: object, name: string, value: unknown) {
    const parentPathEnd = name.lastIndexOf(".");
    const parent = parentPathEnd === -1 ? defaultValues : get(defaultValues, name.slice(0, parentPathEnd));
    if (parent == null || typeof parent !== "object" || get(defaultValues, name) !== undefined) {
        return false;
    }
    set(defaultValues, name, value);
    return true;
}

type Rules<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = UseControllerProps<TFieldValues, TName>["rules"];

// React Hook Form keeps only string messages, so the required rule fails without one and the adapter shows `requiredMessage` for it
export function withRequiredRule<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    rules: Rules<TFieldValues, TName>,
    required: boolean,
    isEmpty: (value: unknown) => boolean,
): Rules<TFieldValues, TName> {
    if (!required) {
        return rules;
    }
    const validate = rules?.validate;
    const otherValidations = typeof validate === "function" ? { validate } : (validate ?? {});
    const requiredValidation: Validate<unknown, TFieldValues> = (value) => !isEmpty(value);
    return { ...rules, validate: { [requiredRuleKey]: requiredValidation, ...otherValidations } } as Rules<TFieldValues, TName>;
}

function isEmptyScalar(value: unknown) {
    return value === undefined || value === null || value === "";
}

export function toErrorMessage(error: { type?: string; message?: string } | undefined, requiredMessage: ReactNode): ReactNode {
    if (error == null) {
        return undefined;
    }
    if (error.message) {
        return error.message;
    }
    return error.type === requiredRuleKey ? requiredMessage : undefined;
}

export interface UseFieldAdapterOptions<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> extends ReactHookFormFieldConfig<
    TFieldValues,
    TName
> {
    name: TName;
    required?: boolean;
    requiredMessage?: ReactNode;
    isEmpty?: (value: unknown) => boolean;
    /**
     * Which values count as nothing entered for `setValue`.
     *
     * @defaultValue `undefined`, `null`, and `""`
     */
    isBlank?: (value: unknown) => boolean;
}

export function useFieldAdapter<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>, Element extends HTMLElement>(
    {
        name,
        control,
        rules,
        defaultValue,
        shouldUnregister,
        warn,
        required = false,
        requiredMessage = defaultRequiredMessage,
        isEmpty = isEmptyValue,
        isBlank = isEmptyScalar,
    }: UseFieldAdapterOptions<TFieldValues, TName>,
    forwardedRef: Ref<Element> | undefined,
) {
    const adapterConfig = useFieldAdapterConfig();
    // Without a `FormProvider`, `useFormContext` returns `null`
    const formContext: { control: Control<TFieldValues> } | null = useFormContext<TFieldValues>();
    const formControl = control ?? formContext?.control;
    const { field, fieldState, formState } = useController<TFieldValues, TName>({
        name,
        control,
        rules: withRequiredRule<TFieldValues, TName>(rules, required, isEmpty),
        defaultValue,
        shouldUnregister,
    });

    // A rule without a message, e.g. `{ maxLength: 10 }`, still blocks submitting, so the field shows as invalid even without a text
    const validationProps = fieldValidationProps({
        hasError: fieldState.error != null,
        error: toErrorMessage(fieldState.error, requiredMessage),
        warning: warn?.(field.value),
        touchedOrSubmitted: fieldState.isTouched || formState.isSubmitted,
        config: adapterConfig,
    });

    const fieldRef = field.ref;
    const ref = useMemo(
        () =>
            mergeRefs<Element>(forwardedRef, (element) => {
                // The ui components' roots aren't always focusable, so React Hook Form gets the element inside to focus on an error
                fieldRef(element == null ? null : { focus: () => focusTarget(element)?.focus() });
            }),
        [forwardedRef, fieldRef],
    );

    // React Hook Form compares the whole form values with the default values to tell whether the form is dirty. A field without a
    // default value gets an entry in the form values but none in the default values, so the form would stay dirty once that field was
    // set, even back to empty: the field gets an empty entry in the default values, too, and the control's empty value once it's set
    // to that, e.g. `false` for an unchecked checkbox.
    useEffect(() => {
        if (formControl == null || !setMissingDefaultValue(formControl._defaultValues, name, undefined)) {
            return;
        }
        if (get(formControl._formValues, name) === undefined) {
            set(formControl._formValues, name, undefined);
        }
    }, [formControl, name]);

    const change = (value: unknown) => {
        if (formControl != null && isEmptyValue(value)) {
            setMissingDefaultValue(formControl._defaultValues, name, value);
        }
        field.onChange(value);
    };

    // React Hook Form compares with the default value as is, so writing back a blank default keeps a field that was emptied again pristine
    const setValue = (value: unknown) => {
        const initialValue = get(formState.defaultValues, name);
        change(isBlank(value) && isBlank(initialValue) ? initialValue : value);
    };

    const adaptedField: ControllerRenderProps<TFieldValues, TName> = { ...field, onChange: change };

    return { field: adaptedField, validationProps, ref, setValue };
}
