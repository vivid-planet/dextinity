import { createIntl, createIntlCache, type IntlShape, type MessageDescriptor } from "@formatjs/intl";
import { cache, Children, type ReactNode } from "react";

import type { FormattedMessageProps } from "./intl";

type Messages = NonNullable<Parameters<typeof createIntl>[0]["messages"]>;

const getIntlRef = cache((): { current: IntlShape<ReactNode> | null } => ({ current: null }));

// react-intl can't be used in server components because it creates a React context, so server components use @formatjs/intl,
// stored per request via React `cache`. Must be set in every layout and page rendering translated server components,
// as Next.js doesn't render the layout again on client-side navigation.
export function setServerIntl(locale: string, messages: Messages) {
    getIntlRef().current = createIntl<ReactNode>({ locale, defaultLocale: locale, messages }, createIntlCache());
}

export function useIntl(): IntlShape<ReactNode> {
    const intl = getIntlRef().current;

    if (!intl) {
        throw new Error("Server intl isn't set. Call setServerIntl() in the layout or page before rendering translated server components.");
    }

    return intl;
}

export function FormattedMessage({ id, defaultMessage, description, values }: FormattedMessageProps) {
    const intl = useIntl();
    const descriptor: MessageDescriptor = { id, defaultMessage, description };

    return <>{Children.toArray(intl.formatMessage(descriptor, values))}</>;
}
