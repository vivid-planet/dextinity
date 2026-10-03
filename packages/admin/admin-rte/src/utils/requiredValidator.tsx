import { convertFromRaw, type RawDraftContentState } from "draft-js";
import type { FieldValidator } from "final-form";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

const requiredMessage = <FormattedMessage id="dextinity.form.required" defaultMessage="Required" />;

export const requiredValidator = <T extends string | RawDraftContentState | undefined>(...[value]: Parameters<FieldValidator<T>>): ReactNode => {
    if (value === undefined) {
        return requiredMessage;
    }

    const rawState = typeof value === "string" ? JSON.parse(value) : value;
    const contentState = convertFromRaw(rawState);
    const hasText = contentState.hasText();
    return hasText ? undefined : requiredMessage;
};
