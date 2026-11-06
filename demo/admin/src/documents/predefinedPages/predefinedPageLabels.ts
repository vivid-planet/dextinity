import type { GQLPredefinedPageType } from "@src/graphql.generated";
import { defineMessages, type MessageDescriptor } from "react-intl";

export const predefinedPageLabels: Record<GQLPredefinedPageType, MessageDescriptor> = defineMessages({
    news: { id: "predefinedPages.news", defaultMessage: "News" },
});
