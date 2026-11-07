import { isValidElement, type ReactNode } from "react";
import { type FormatNumberOptions, FormattedMessage, FormattedNumber, type IntlShape, type MessageDescriptor } from "react-intl";

type FormattedMessageElementProps = MessageDescriptor & { values?: Record<string, string | number | boolean | null | undefined | Date> };

type FormattedNumberElementProps = FormatNumberOptions & { value: number | bigint };

function isMessageDescriptor(value: unknown): value is MessageDescriptor {
    return typeof value === "object" && value !== null && !isValidElement(value) && "id" in value;
}

/**
 * The plain text of a label: a string or number as is, a `FormattedMessage` or `FormattedNumber` element or a message descriptor formatted
 * with `intl`.
 * `undefined` for any other content, e.g. an element with an icon.
 */
export function messageText(intl: IntlShape, label: ReactNode | MessageDescriptor): string | undefined {
    if (typeof label === "string" || typeof label === "number") {
        return String(label);
    }
    if (isMessageDescriptor(label)) {
        return intl.formatMessage(label);
    }
    if (isValidElement<FormattedMessageElementProps>(label) && label.type === FormattedMessage) {
        const { values, ...descriptor } = label.props;
        return intl.formatMessage(descriptor, values);
    }
    if (isValidElement<FormattedNumberElementProps>(label) && label.type === FormattedNumber) {
        const { value, ...options } = label.props;
        return intl.formatNumber(value, options);
    }
    return undefined;
}
