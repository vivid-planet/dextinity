import { createIntl, createIntlCache, type IntlShape, type MessageDescriptor } from "@formatjs/intl";
import { cache, Children, type ReactNode } from "react";

type ServerIntlMessages = NonNullable<Parameters<typeof createIntl>[0]["messages"]>;

type FormatMessageValues = NonNullable<Parameters<IntlShape<ReactNode>["formatMessage"]>[1]>;

export interface ServerFormattedMessageProps extends Pick<MessageDescriptor, "id" | "defaultMessage" | "description"> {
    values?: FormatMessageValues;
}

const getServerIntlRef = cache((): { current: IntlShape<ReactNode> | null } => ({ current: null }));

/**
 * Sets the intl used by `useServerIntl` and `ServerFormattedMessage` for the current request.
 *
 * Must be called in the layout and in every page rendering translated server components,
 * because Next.js renders layouts and pages concurrently and doesn't render the layout again on client-side navigation.
 */
export function setServerIntl(locale: string, messages: ServerIntlMessages): void {
    getServerIntlRef().current = createIntl<ReactNode>({ locale, defaultLocale: locale, messages }, createIntlCache());
}

export function useServerIntl(): IntlShape<ReactNode> {
    const intl = getServerIntlRef().current;

    if (!intl) {
        throw new Error("Server intl isn't set. Call setServerIntl() in the layout or page before rendering translated server components.");
    }

    return intl;
}

export function ServerFormattedMessage({ id, defaultMessage, description, values }: ServerFormattedMessageProps) {
    const intl = useServerIntl();
    const descriptor: MessageDescriptor = { id, defaultMessage, description };

    return <>{Children.toArray(intl.formatMessage(descriptor, values))}</>;
}
