import { isURL } from "class-validator";
import { FormattedMessage } from "react-intl";

export function validateUrl(url?: string) {
    if (url && !isURL(url)) {
        return <FormattedMessage id="dextinity.validation.validateUrl.invalid" defaultMessage="Invalid URL" />;
    }
}
