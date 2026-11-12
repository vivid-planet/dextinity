import { BlocksBlock, type SupportedBlocks } from "@dextinity/mail-react";
import type { WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { MailButtonBlock } from "@src/mail/blocks/MailButtonBlock";
import { MailDividerBlock } from "@src/mail/blocks/MailDividerBlock";
import { MailImageBlock } from "@src/mail/blocks/MailImageBlock";
import { MailSpacerBlock } from "@src/mail/blocks/MailSpacerBlock";
import { MailTipTapRichTextBlock } from "@src/mail/blocks/MailTipTapRichTextBlock";
import { MailTwoColumnsBlock } from "@src/mail/blocks/MailTwoColumnsBlock";
import { MailTwoListSizesTipTapRichTextBlock } from "@src/mail/blocks/MailTwoListSizesTipTapRichTextBlock";

const supportedBlocks: SupportedBlocks = {
    twoListSizesTipTapText: (data) => <MailTwoListSizesTipTapRichTextBlock data={data} />,
    tipTapText: (data) => <MailTipTapRichTextBlock data={data} />,
    image: (data) => <MailImageBlock data={data} />,
    button: (data) => <MailButtonBlock data={data} />,
    divider: (data) => <MailDividerBlock data={data} />,
    spacer: (data) => <MailSpacerBlock data={data} />,
    twoColumns: (data) => <MailTwoColumnsBlock data={data} />,
};

interface Props {
    content: WelcomeEmailContentBlockData;
}

export const WelcomeEmailContentBlock = ({ content }: Props) => {
    return <BlocksBlock data={content} supportedBlocks={supportedBlocks} />;
};
