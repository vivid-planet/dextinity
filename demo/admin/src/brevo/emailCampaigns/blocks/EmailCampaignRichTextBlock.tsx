import { BlockAdminComponentPaper, BlockAdminComponentSection, type BlockInterface, type BlockState } from "@dextinity/cms-admin";
import { CopyField, KeyValueList } from "@dextinity/ui";
import type { RichTextBlockData } from "@src/blocks.generated";
import { MailRichTextBlock } from "@src/mail/blocks/MailRichTextBlock";
import { FormattedMessage, useIntl } from "react-intl";

function PlaceholderList() {
    const intl = useIntl();
    const placeholders = [
        {
            placeholder: "{{SALUTATION}}",
            description: intl.formatMessage({ id: "richText.placeholder.salutation", defaultMessage: "Dear Mr./Ms. LASTNAME" }),
        },
    ];
    const copyFieldLabels = {
        copy: intl.formatMessage({ id: "richText.placeholder.copy", defaultMessage: "Copy placeholder" }),
        copied: intl.formatMessage({ id: "richText.placeholder.copied", defaultMessage: "Copied" }),
    };

    return (
        <KeyValueList
            items={placeholders.map(({ placeholder, description }) => ({
                key: description,
                value: <CopyField value={placeholder} labels={copyFieldLabels} />,
            }))}
        />
    );
}

export const EmailCampaignRichTextBlock: BlockInterface<RichTextBlockData, BlockState<typeof MailRichTextBlock>> = {
    ...MailRichTextBlock,
    AdminComponent: (rteAdminComponentProps) => (
        <>
            <BlockAdminComponentSection>
                <MailRichTextBlock.AdminComponent {...rteAdminComponentProps} />
            </BlockAdminComponentSection>
            <BlockAdminComponentSection
                title={<FormattedMessage id="richText.placeholder.info" defaultMessage="Placeholders available in the text" />}
            >
                <BlockAdminComponentPaper>
                    <PlaceholderList />
                </BlockAdminComponentPaper>
            </BlockAdminComponentSection>
        </>
    ),
};
