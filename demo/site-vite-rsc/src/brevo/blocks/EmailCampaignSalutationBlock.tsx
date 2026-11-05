import { MjmlColumn, MjmlSection, MjmlText, type PropsWithData, withPreview } from "@dextinity/mail-react";
import type { RichTextBlockData } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

export const EmailCampaignSalutationBlock = withPreview<PropsWithData<RichTextBlockData>>(
    ({ className }) => {
        return (
            <MjmlSection indent className={className}>
                <MjmlColumn>
                    <MjmlText>
                        <FormattedMessage id="salutationBlock.salutation" defaultMessage="Dear customer!" />
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>
        );
    },
    { label: "Salutation" },
);
