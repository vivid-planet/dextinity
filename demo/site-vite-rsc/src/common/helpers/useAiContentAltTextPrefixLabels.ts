import type { AiContentAltTextPrefixLabels } from "@dextinity/site-react";
import { useIntl } from "react-intl";

export function useAiContentAltTextPrefixLabels(): AiContentAltTextPrefixLabels {
    const intl = useIntl();

    return {
        generated: intl.formatMessage({ id: "aiContentDisclosure.altTextPrefix.generated", defaultMessage: "AI-generated" }),
        modified: intl.formatMessage({ id: "aiContentDisclosure.altTextPrefix.modified", defaultMessage: "AI-modified" }),
    };
}
