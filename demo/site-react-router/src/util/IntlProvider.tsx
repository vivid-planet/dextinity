"use client";

import type { ComponentProps, PropsWithChildren } from "react";
import { IntlProvider as LibraryIntlProvider } from "react-intl";

type Messages = ComponentProps<typeof LibraryIntlProvider>["messages"];

export function IntlProvider({ children, locale, messages }: PropsWithChildren<{ locale: string; messages: Messages }>) {
    return (
        <LibraryIntlProvider locale={locale} defaultLocale={locale} messages={messages}>
            {children}
        </LibraryIntlProvider>
    );
}
