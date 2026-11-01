import type { AiContentAltTextPrefixLabels } from "@dextinity/site-nextjs";

import { useIntl } from "#intl";

export function useAiContentAltTextPrefixLabels(): AiContentAltTextPrefixLabels {
    const intl = useIntl();

    return {
        generated: intl.formatMessage({ id: "aiContentDisclosure.altTextPrefix.generated", defaultMessage: "AI-generated" }),
        modified: intl.formatMessage({ id: "aiContentDisclosure.altTextPrefix.modified", defaultMessage: "AI-modified" }),
    };
}
