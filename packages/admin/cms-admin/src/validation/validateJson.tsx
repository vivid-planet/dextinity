import { FormattedMessage } from "react-intl";

export function validateJson(value?: string) {
    if (!value) {
        return;
    }
    try {
        JSON.parse(value);
    } catch {
        return <FormattedMessage id="dextinity.validation.validateJson.invalid" defaultMessage="Invalid JSON" />;
    }
}
