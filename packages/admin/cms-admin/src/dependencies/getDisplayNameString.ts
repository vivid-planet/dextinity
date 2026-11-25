import { isValidElement, type PropsWithChildren, type ReactElement, type ReactNode } from "react";
import { FormattedMessage, type IntlShape, type MessageDescriptor } from "react-intl";

type FormattedMessageProps = MessageDescriptor & { values?: Parameters<IntlShape["formatMessage"]>[1] };

function isFormattedMessage(node: ReactNode): node is ReactElement<FormattedMessageProps> {
    return isValidElement(node) && node.type === FormattedMessage;
}

// Only reads text that is part of the node itself, a component that renders its own text can't be resolved without rendering it.
function getTextContent(node: ReactNode, intl: IntlShape): string {
    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }
    if (Array.isArray(node)) {
        return node.map((child) => getTextContent(child, intl)).join("");
    }
    if (isFormattedMessage(node)) {
        const { values, ...descriptor } = node.props;
        return String(intl.formatMessage(descriptor, values));
    }
    if (isValidElement<PropsWithChildren>(node)) {
        return getTextContent(node.props.children, intl);
    }
    return "";
}

export function getDisplayNameString(displayName: ReactNode, intl: IntlShape, fallback: string): string {
    return getTextContent(displayName, intl).trim() || fallback;
}
