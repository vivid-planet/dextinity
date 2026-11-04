import type { ReactNode } from "react";

interface Props {
    message: string;
    warningMessages: Record<string, ReactNode>;
}

export function WarningMessage({ message, warningMessages }: Props) {
    const warning = warningMessages[message as keyof typeof warningMessages];

    if (warning) {
        return warning;
    } else {
        console.error(`Missing warning message for "${message}". Custom warning messages can be passed to WarningsPage component.`);
        return message;
    }
}
