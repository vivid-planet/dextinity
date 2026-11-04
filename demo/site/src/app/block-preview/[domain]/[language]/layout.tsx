import { fetchPredefinedPages } from "@src/documents/predefinedPages/predefinedPages.loader";
import { PredefinedPagesProvider } from "@src/documents/predefinedPages/PredefinedPagesProvider";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages";

export default async function Page({ children, params }: LayoutProps<"/block-preview/[domain]/[language]">) {
    const { domain, language } = await params;
    const [messages, predefinedPages] = await Promise.all([
        loadMessages(language),
        fetchPredefinedPages({ domain, graphQLFetch: createGraphQLFetch() }),
    ]);
    return (
        <IntlProvider locale={language} messages={messages}>
            <PredefinedPagesProvider predefinedPages={predefinedPages}>{children}</PredefinedPagesProvider>
        </IntlProvider>
    );
}
