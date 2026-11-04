import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages";

export default async function Page({ children, params }: LayoutProps<"/block-preview/[domain]/[language]">) {
    const { language } = await params;
    const messages = await loadMessages(language);
    return (
        <IntlProvider locale={language} messages={messages}>
            {children}
        </IntlProvider>
    );
}
