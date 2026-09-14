import { createDependencyMethods, DamImageBlock, type DependencyInterface } from "@dextinity/cms-admin";
import { NewsContentBlock } from "@src/news/blocks/NewsContentBlock";
import { FormattedMessage } from "react-intl";

export const NewsDependency: DependencyInterface = {
    displayName: <FormattedMessage id="news.displayName" defaultMessage="News" />,
    ...createDependencyMethods({
        rootQueryName: "news",
        rootBlocks: { content: { block: NewsContentBlock, path: "/form" }, image: DamImageBlock },
        basePath: ({ id }) => `/structured-content/news/${id}/edit`,
    }),
};
