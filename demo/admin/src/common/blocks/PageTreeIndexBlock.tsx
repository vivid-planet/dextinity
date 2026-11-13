import { type BlockInterface, createBlockSkeleton } from "@dextinity/cms-admin";
import type { PageTreeIndexBlockData, PageTreeIndexBlockInput } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

export const PageTreeIndexBlock: BlockInterface<PageTreeIndexBlockData, Record<string, never>, PageTreeIndexBlockInput> = {
    ...createBlockSkeleton(),
    name: "PageTreeIndex",
    displayName: <FormattedMessage id="blocks.pageTreeIndex" defaultMessage="Page Tree Index" />,
    iconName: "sitemap",
    description: <FormattedMessage id="blocks.pageTreeIndex.description" defaultMessage="Links to the pages below this one" />,
    defaultValues: () => ({}),
};
