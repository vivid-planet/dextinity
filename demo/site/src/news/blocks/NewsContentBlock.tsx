import { BlocksBlock, type PropsWithData, type SupportedBlocks } from "@dextinity/site-nextjs";
import type { NewsContentBlockData } from "@src/blocks.generated";
import { DamImageBlock } from "@src/common/blocks/DamImageBlock";
import { HeadingBlock } from "@src/common/blocks/HeadingBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { PageContentTextImageBlock } from "@src/common/blocks/TextImageBlock";

const supportedBlocks: SupportedBlocks = {
    heading: (props) => <HeadingBlock data={props} />,
    richText: (props) => <RichTextBlock data={props} />,
    image: (props) => <DamImageBlock data={props} aspectRatio="inherit" />,
    textImage: (props) => <PageContentTextImageBlock data={props} />,
};

export const NewsContentBlock = ({ data }: PropsWithData<NewsContentBlockData>) => {
    return <BlocksBlock data={data} supportedBlocks={supportedBlocks} />;
};
