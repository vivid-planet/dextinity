import { convertFromRaw, type RawDraftContentState } from "draft-js";
import type { FieldValidator } from "final-form";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

const requiredMessage = <FormattedMessage id="dextinity.form.required" defaultMessage="Required" />;

/**
 * Generic over the field value because `FieldValidator` is invariant in it: `FieldState` both accepts and returns the
 * value, so a single `FieldValidator<string | RawDraftContentState | undefined>` cannot be passed to a `string`-valued
 * `Field`. As a generic it stays a `FieldValidator` for either field value.
 */
export const requiredValidator = <T extends string | RawDraftContentState | undefined>(...[value]: Parameters<FieldValidator<T>>): ReactNode => {
    if (value === undefined) {
        return requiredMessage;
    }

    const rawState = typeof value === "string" ? JSON.parse(value) : value;
    const contentState = convertFromRaw(rawState);
    const hasText = contentState.hasText();
    return hasText ? undefined : requiredMessage;
};
