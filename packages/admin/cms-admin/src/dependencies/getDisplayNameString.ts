import { isValidElement, type ReactElement, type ReactNode } from "react";
import { FormattedMessage, type IntlShape, type MessageDescriptor } from "react-intl";

function isFormattedMessage(node: ReactNode): node is ReactElement<MessageDescriptor> {
    return isValidElement(node) && node.type === FormattedMessage;
}

export function getDisplayNameString(displayName: ReactNode, intl: IntlShape, fallback: string): string {
    if (typeof displayName === "string") {
        return displayName;
    }
    if (isFormattedMessage(displayName)) {
        return intl.formatMessage(displayName.props);
    }
    return fallback;
}
