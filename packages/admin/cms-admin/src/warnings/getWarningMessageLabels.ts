import type { IntlShape } from "react-intl";

import { getDisplayNameString } from "../dependencies/getDisplayNameString";
import type { WarningsConfig } from "./warningsConfig";

export function getWarningMessageLabels({ messages, messageLabels = {} }: WarningsConfig, intl: IntlShape) {
    return Object.entries(messages).map(([message, displayedMessage]) => {
        const configuredLabel = messageLabels[message];
        if (configuredLabel === undefined) {
            return { message, label: getDisplayNameString(displayedMessage, intl, message) };
        }
        return { message, label: typeof configuredLabel === "string" ? configuredLabel : intl.formatMessage(configuredLabel) };
    });
}
