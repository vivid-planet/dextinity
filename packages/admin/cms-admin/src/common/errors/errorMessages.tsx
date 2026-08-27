import { messages } from "@dextinity/admin";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

export const formatStrong = (chunks: ReactNode[]) => <strong>{chunks}</strong>;

export const NetworkError = () => (
    <FormattedMessage
        {...messages.networkError}
        values={{
            strong: formatStrong,
        }}
    />
);

export const UnknownError = () => (
    <FormattedMessage
        {...messages.unknownError}
        values={{
            strong: formatStrong,
        }}
    />
);
