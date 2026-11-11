import { type FieldValidator, getIn } from "final-form";
import { type ReactNode, type Ref, useMemo } from "react";
import { useField, useForm } from "react-final-form";

import { useFieldAdapterConfig } from "../fieldAdapterConfig/FieldAdapterConfigProvider";
import { useFieldElementRef } from "../focusOnError/fieldElements";
import { mergeRefs } from "../utils/mergeRefs";
import { fieldValidationProps } from "./fieldValidationProps";
import type { FinalFormFieldConfig } from "./finalFormFieldConfig";
import { isEqualTreatingEmptyAlike } from "./isEqualTreatingEmptyAlike";

const defaultRequiredMessage = "Required";

function isEmptyValue(value: unknown) {
    return value === undefined || value === null || value === "" || value === false || (Array.isArray(value) && value.length === 0);
}

export interface UseFieldAdapterOptions<FieldValue, ControlValue> extends FinalFormFieldConfig<FieldValue, ControlValue> {
    required?: boolean;
    requiredMessage?: ReactNode;
    isEmpty?: (value: FieldValue) => boolean;
}

function warningFromData(data: unknown): ReactNode {
    return typeof data === "object" && data !== null && "warning" in data ? (data.warning as ReactNode) : undefined;
}

export function useFieldAdapter<FieldValue, ControlValue, Element extends HTMLElement>(
    name: string,
    {
        required = false,
        requiredMessage = defaultRequiredMessage,
        isEmpty = isEmptyValue,
        validate,
        warn,
        isEqual = isEqualTreatingEmptyAlike,
        ...config
    }: UseFieldAdapterOptions<FieldValue, ControlValue>,
    forwardedRef: Ref<Element> | undefined,
) {
    const form = useForm("useFieldAdapter");
    const adapterConfig = useFieldAdapterConfig();
    const validateWithRequired: FieldValidator<FieldValue> | undefined = required
        ? (value, allValues, meta) => (isEmpty(value) ? requiredMessage : validate?.(value, allValues, meta))
        : validate;
    const { input, meta } = useField<FieldValue, Element, ControlValue>(name, { ...config, isEqual, validate: validateWithRequired });

    const error: ReactNode = meta.error || (meta.dirtySinceLastSubmit ? undefined : meta.submitError);
    const warning: ReactNode = warningFromData(meta.data) ?? warn?.(getIn(form.getState().values, name) as FieldValue);
    const validationProps = fieldValidationProps({
        hasError: Boolean(error),
        error,
        warning,
        touchedOrSubmitted: Boolean(meta.touched || meta.submitFailed),
        config: adapterConfig,
    });

    const elementRef = useFieldElementRef(form, name);
    const ref = useMemo(() => mergeRefs<Element>(forwardedRef, elementRef), [forwardedRef, elementRef]);

    const onBlur = () => input.onBlur();
    const onFocus = () => input.onFocus();

    return { input, meta, validationProps, ref, onBlur, onFocus };
}
