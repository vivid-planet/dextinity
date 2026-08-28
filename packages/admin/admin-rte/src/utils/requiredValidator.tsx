import { convertFromRaw, type RawDraftContentState } from "draft-js";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

const requiredMessage = <FormattedMessage id="dextinity.form.required" defaultMessage="Required" />;

export const requiredValidator = (value: string | RawDraftContentState | undefined): ReactNode => {
    if (value === undefined) {
        return requiredMessage;
    }

    const rawState = typeof value === "string" ? JSON.parse(value) : value;
    const contentState = convertFromRaw(rawState);
    const hasText = contentState.hasText();
    return hasText ? undefined : requiredMessage;
};
