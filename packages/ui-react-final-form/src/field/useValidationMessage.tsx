import { type ReactNode, useId } from "react";

import type { FieldAdapterValidationProps } from "./useFieldAdapter";
import { ValidationMessage } from "./ValidationMessage";

export function useValidationMessage({ validationMessage }: FieldAdapterValidationProps, ariaDescribedBy: string | undefined) {
    const messageId = `${useId()}message`;
    const shows = validationMessage != null && validationMessage !== "";
    const message: ReactNode = shows ? <ValidationMessage id={messageId}>{validationMessage}</ValidationMessage> : null;
    const describedBy = [ariaDescribedBy, shows ? messageId : undefined].filter(Boolean).join(" ") || undefined;
    return { message, describedBy };
}
