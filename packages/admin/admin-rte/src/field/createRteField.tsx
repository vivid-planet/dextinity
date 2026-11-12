import { Field, type FieldProps } from "@dextinity/admin";
import type { FunctionComponent } from "react";

import type { RteProps } from "../core/Rte";
import { requiredValidator } from "../utils/requiredValidator";
import createFinalFormRte, { type IConfig } from "./createFinalFormRte";

export type RteFieldProps = FieldProps<string, HTMLInputElement> & Partial<RteProps>;

// Same as in `Field` from `@dextinity/admin`
const composeValidators =
    (...validators: Array<(value: any, allValues: object) => any>) =>
    (value: any, allValues: object) =>
        validators.reduce((error, validator) => error || validator(value, allValues), undefined);

export const createRteField = (config?: IConfig) => {
    const { RteField: RteFieldComponent, RteReadOnly } = createFinalFormRte(config);

    const RteField: FunctionComponent<RteFieldProps> = ({ required, validate, ...restProps }) => {
        const validateError = required ? (validate ? composeValidators(requiredValidator, validate) : requiredValidator) : validate;
        return <Field component={RteFieldComponent} required={required} validate={validateError} {...restProps} />;
    };
    return { RteField, RteReadOnly };
};
