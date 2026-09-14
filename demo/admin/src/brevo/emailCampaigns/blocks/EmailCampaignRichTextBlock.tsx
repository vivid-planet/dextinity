import { CopyToClipboardButton } from "@dextinity/admin";
import { BlockAdminComponentPaper, BlockAdminComponentSection, type BlockInterface, type BlockState } from "@dextinity/cms-admin";
import { Box, List, ListItem, ListItemText } from "@mui/material";
import type { RichTextBlockData } from "@src/blocks.generated";
import { MailRichTextBlock } from "@src/mail/blocks/MailRichTextBlock";
import { FormattedMessage } from "react-intl";

const placeholders = [
    {
        placeholder: "{{SALUTATION}}",
        helper: <FormattedMessage id="richText.placeholder.salutation" defaultMessage="Dear Mr./Ms. LASTNAME" />,
    },
];

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
                <BlockAdminComponentPaper disablePadding>
                    <List>
                        {placeholders.map(({ placeholder, helper }) => {
                            const placeholderText = <Box sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{placeholder}</Box>;
                            return (
                                <ListItem key={placeholder} secondaryAction={<CopyToClipboardButton copyText={placeholder} />}>
                                    <ListItemText primary={placeholderText} secondary={helper} />
                                </ListItem>
                            );
                        })}
                    </List>
                </BlockAdminComponentPaper>
            </BlockAdminComponentSection>
        </>
    ),
};
