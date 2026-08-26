import { BlocksBlock, type SupportedBlocks } from "@dextinity/mail-react";
import type { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { EmailCampaignSalutationBlock } from "@src/brevo/blocks/EmailCampaignSalutationBlock";
import { MailButtonBlock } from "@src/mail/blocks/MailButtonBlock";
import { MailDividerBlock } from "@src/mail/blocks/MailDividerBlock";
import { MailImageBlock } from "@src/mail/blocks/MailImageBlock";
import { MailRichTextBlock } from "@src/mail/blocks/MailRichTextBlock";
import { MailSpacerBlock } from "@src/mail/blocks/MailSpacerBlock";
import { MailTwoListSizesRichTextBlock } from "@src/mail/blocks/MailTwoListSizesRichTextBlock";

const supportedBlocks: SupportedBlocks = {
    text: (data) => <MailRichTextBlock data={data} />,
    twoListSizesText: (data) => <MailTwoListSizesRichTextBlock data={data} />,
    image: (data) => <MailImageBlock data={data} />,
    button: (data) => <MailButtonBlock data={data} />,
    divider: () => <MailDividerBlock />,
    spacer: (data) => <MailSpacerBlock data={data} />,
    salutation: (data) => <EmailCampaignSalutationBlock data={data} />,
};

interface Props {
    content: EmailCampaignContentBlockData;
}

export const EmailCampaignContentBlock = ({ content }: Props) => {
    return <BlocksBlock data={content} supportedBlocks={supportedBlocks} />;
};
