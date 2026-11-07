// A named import of `cache` fails to load with React 18, which has no `cache`
// eslint-disable-next-line no-restricted-imports
import * as React from "react";
import { createIntl, createIntlCache, type IntlConfig, type IntlShape, type MessageDescriptor } from "react-intl/server";

type ServerIntlMessages = IntlConfig["messages"];

type FormatMessageValues = NonNullable<Parameters<IntlShape["formatMessage"]>[1]>;

export interface ServerFormattedMessageProps extends Pick<MessageDescriptor, "id" | "defaultMessage" | "description"> {
    values?: FormatMessageValues;
}

type ServerIntlRef = { current: IntlShape | null };

const intlCache = createIntlCache();

let getServerIntlRefForRequest: (() => ServerIntlRef) | undefined;

function getServerIntlRef(): ServerIntlRef {
    getServerIntlRefForRequest ??= React.cache((): ServerIntlRef => ({ current: null }));
    return getServerIntlRefForRequest();
}

/**
 * Sets the intl used by `useServerIntl` and `ServerFormattedMessage` for the current request.
 *
 * Must be called in the layout and in every page rendering translated server components,
 * because Next.js renders layouts and pages concurrently and doesn't render the layout again on client-side navigation.
 */
export function setServerIntl(locale: string, messages: ServerIntlMessages): void {
    getServerIntlRef().current = createIntl({ locale, defaultLocale: locale, messages }, intlCache);
}

export function useServerIntl(): IntlShape {
    const intl = getServerIntlRef().current;

    if (!intl) {
        throw new Error("Server intl isn't set. Call setServerIntl() in the layout or page before rendering translated server components.");
    }

    return intl;
}

export function ServerFormattedMessage({ id, defaultMessage, description, values }: ServerFormattedMessageProps): React.ReactNode {
    const intl = useServerIntl();

    const descriptor: MessageDescriptor = { id, defaultMessage, description };

    return <>{intl.formatMessage(descriptor, values)}</>;
}
