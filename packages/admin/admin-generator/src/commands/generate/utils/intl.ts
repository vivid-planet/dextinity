import { type ComponentProps, isValidElement, type ReactElement } from "react";
import { FormattedMessage } from "react-intl";

import type { FormattedMessageElement } from "../generate-command";

type GenerateFormattedMessageOptions = (
    { config: string | FormattedMessageElement | undefined; defaultMessage: string } | { config: string | FormattedMessageElement }
) & { id: string; type: "jsx" | "intlCall" };

export function isFormattedMessageElement(node: unknown): node is ReactElement<ComponentProps<typeof FormattedMessage>, typeof FormattedMessage> {
    return isValidElement(node) && node.type === FormattedMessage;
}

/**
 * Generates a <FormattedMessage> JSX element or an intl.formatMessage call string supporting <FormattedMessage> config objects.
 *
 * either config or defaultMessage is required
 */
export const generateFormattedMessage = (options: GenerateFormattedMessageOptions) => {
    let id = options.id;
    let defaultMessage = "";

    if ("defaultMessage" in options) {
        defaultMessage = options.defaultMessage;
    }
    if (isFormattedMessageElement(options.config)) {
        if (!options.config.props.id) {
            throw new Error("FormattedMessage requires an id");
        }
        id = options.config.props.id;
        if (!options.config.props.defaultMessage) {
            throw new Error("FormattedMessage requires an defaultMessage");
        }
        if (typeof options.config.props.defaultMessage !== "string") {
            throw new Error("FormattedMessage requires a string defaultMessage");
        }
        defaultMessage = options.config.props.defaultMessage;
    } else if (typeof options.config === "string") {
        defaultMessage = options.config;
    }
    if (options.type === "jsx") {
        return `<FormattedMessage id=${JSON.stringify(id)} defaultMessage=${JSON.stringify(defaultMessage)} />`;
    } else {
        return `intl.formatMessage({ id: ${JSON.stringify(id)}, defaultMessage: ${JSON.stringify(defaultMessage)} })`;
    }
};
