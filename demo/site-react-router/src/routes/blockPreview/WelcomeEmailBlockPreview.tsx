import { getMailConfig } from "@src/mail/util/getMailConfig";

import type { Route } from "./+types/WelcomeEmailBlockPreview";
import { WelcomeEmailBlockPreviewContent } from "./WelcomeEmailBlockPreviewContent";

export function ServerComponent({ params: { domain, language } }: Route.ServerComponentProps) {
    return <WelcomeEmailBlockPreviewContent config={getMailConfig({ domain, language })} />;
}
