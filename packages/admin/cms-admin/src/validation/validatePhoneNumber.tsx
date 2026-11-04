import { FormattedMessage } from "react-intl";

import { isPhoneNumber } from "./isPhoneNumber";

export function validatePhoneNumber(value?: string) {
    if (value && !isPhoneNumber(value)) {
        return <FormattedMessage id="dextinity.validation.validatePhoneNumber.invalid" defaultMessage="Invalid phone number" />;
    }
}
