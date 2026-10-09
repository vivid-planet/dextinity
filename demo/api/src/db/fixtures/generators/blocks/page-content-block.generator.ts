import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import type { Spacing } from "@src/common/blocks/space.block";
import { faker } from "@src/db/fixtures/faker";
import type { PageContentBlock } from "@src/documents/pages/blocks/page-content.block";
import { UserGroup } from "@src/user-groups/user-group";

export type PageContentBlockItem = ExtractBlockInputFactoryProps<typeof PageContentBlock>["blocks"][number];

/** Wraps the props of a supported block into an entry of the page content, visible to every user group. */
export function generateContentBlock<Type extends PageContentBlockItem["type"]>({
    type,
    props,
}: {
    type: Type;
    props: Extract<PageContentBlockItem, { type: Type }>["props"];
}): PageContentBlockItem {
    return {
        key: faker.string.uuid(),
        visible: true,
        type,
        props,
        // TODO add custom block attributes to BlocksBlock types
        // @ts-expect-error custom block attributes aren't reflected in types
        userGroup: UserGroup.all,
    };
}

export function generateHeadingBlock({ text, level }: { text: string; level: 1 | 2 | 3 | 4 | 5 }): PageContentBlockItem {
    return generateContentBlock({
        type: "tipTapRichText",
        props: {
            tipTapContent: {
                type: "doc",
                content: [{ type: "textBlock", attrs: { textBlock: `heading-${level}` }, content: [{ type: "text", text }] }],
            },
        },
    });
}

export function generateSpaceBlock(spacing: Spacing): PageContentBlockItem {
    return generateContentBlock({ type: "space", props: { spacing } });
}
