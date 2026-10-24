import { DefaultTitle } from "@src/layout/DefaultTitle";
import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages";
import type { PropsWithChildren } from "react";

export default async function BlockPreviewLanguageLayout({ children, language }: PropsWithChildren<{ language: string }>) {
    const messages = await loadMessages(language);
    return (
        <IntlProvider locale={language} messages={messages}>
            <DefaultTitle />
            {children}
        </IntlProvider>
    );
}
