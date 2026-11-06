import type { FieldValidator } from "final-form";
import { type ReactNode, type Ref, useMemo } from "react";
import { useField, useForm } from "react-final-form";

import { useFieldElementRef } from "../focusOnError/fieldElements";
import { mergeRefs } from "../utils/mergeRefs";
import type { FinalFormFieldConfig } from "./finalFormFieldConfig";

const defaultRequiredMessage = "Required";

export function isEmptyValue(value: unknown) {
    return value === undefined || value === null || value === "" || value === false || (Array.isArray(value) && value.length === 0);
}

export interface UseFieldAdapterOptions<FieldValue, ControlValue> extends FinalFormFieldConfig<FieldValue, ControlValue> {
    required?: boolean;
    requiredMessage?: ReactNode;
    isEmpty?: (value: FieldValue) => boolean;
}

export interface FieldAdapterValidationProps {
    state?: "error";
    validationMessage?: ReactNode;
}

export function useFieldAdapter<FieldValue, ControlValue, Element extends HTMLElement>(
    name: string,
    {
        required = false,
        requiredMessage = defaultRequiredMessage,
        isEmpty = isEmptyValue,
        validate,
        ...config
    }: UseFieldAdapterOptions<FieldValue, ControlValue>,
    forwardedRef: Ref<Element> | undefined,
) {
    const form = useForm("useFieldAdapter");
    const validateWithRequired: FieldValidator<FieldValue> | undefined = required
        ? (value, allValues, meta) => (isEmpty(value) ? requiredMessage : validate?.(value, allValues, meta))
        : validate;
    const { input, meta } = useField<FieldValue, Element, ControlValue>(name, { ...config, validate: validateWithRequired });

    const error: ReactNode = meta.error || (meta.dirtySinceLastSubmit ? undefined : meta.submitError);
    const showsError = Boolean(error) && (meta.touched || meta.submitFailed);
    const validationProps: FieldAdapterValidationProps = showsError ? { state: "error", validationMessage: error } : {};

    const elementRef = useFieldElementRef(form, name);
    const ref = useMemo(() => mergeRefs<Element>(forwardedRef, elementRef), [forwardedRef, elementRef]);

    const onBlur = () => input.onBlur();
    const onFocus = () => input.onFocus();

    return { input, meta, validationProps, ref, onBlur, onFocus };
}
