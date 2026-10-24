import { getMailConfig } from "@src/mail/util/getMailConfig";
import type { ContentScope } from "@src/site-configs";
import { loadMessages } from "@src/util/loadMessages";

import { WelcomeEmailPreview } from "./WelcomeEmailPreview";

export default async function Page({ domain, language }: ContentScope) {
    const messages = await loadMessages(language);

    return <WelcomeEmailPreview language={language} messages={messages} config={getMailConfig({ domain, language })} />;
}
