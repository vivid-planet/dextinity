import { isValidElement, type ReactNode } from "react";
import type { IntlShape, MessageDescriptor } from "react-intl";

import type { AllCategories } from "../pageTree/PageTreeContext";

type FormattedMessageProps = MessageDescriptor & { values?: Record<string, string | number> };

function isFormattedMessageProps(props: unknown): props is FormattedMessageProps {
    return typeof props === "object" && props != null && "id" in props && typeof props.id === "string";
}

/**
 * The text of a category's label, for components that take text, e.g. a `MenuItem`. Labels are usually a `<FormattedMessage>`,
 * which is formatted here; other elements fall back to the category's name.
 */
export function getCategoryLabelText({ category, label }: AllCategories[number], intl: IntlShape): string {
    const node: ReactNode = label;
    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }
    if (isValidElement(node) && isFormattedMessageProps(node.props)) {
        const { values, ...descriptor } = node.props;
        return intl.formatMessage(descriptor, values);
    }
    return category;
}
