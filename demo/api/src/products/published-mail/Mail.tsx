import { MjmlColumn, MjmlMailRoot, MjmlSection, MjmlSpacer, MjmlText } from "@dextinity/mail-react";
import type { RichTextBlockData } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

import { MjmlRichTextBlock } from "./RichTextBlock";
import { theme } from "./theme";

export type MailProps = {
    recipient: { name: string; email: string; language: string };
    countProductPublished: "all" | number;
    supportInfo?: RichTextBlockData;
};

export const Mail = ({ recipient, countProductPublished, supportInfo }: MailProps) => {
    return (
        <MjmlMailRoot theme={theme}>
            <MjmlSection>
                <MjmlColumn>
                    <MjmlSpacer height="20px" />
                </MjmlColumn>
            </MjmlSection>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlText variant="heading" bottomSpacing>
                        <FormattedMessage
                            id="productPublishedMail.salutation"
                            defaultMessage="Hello {recipientName}"
                            values={{ recipientName: recipient.name }}
                        />
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlText>
                        <FormattedMessage
                            id="productPublishedMail.text"
                            defaultMessage="{numberOfProductsPublished, select, all {All products} 1 {A product has} other {{numberOfProductsPublished} products have}} been published."
                            values={{ numberOfProductsPublished: countProductPublished }}
                        />
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>
            {supportInfo ? (
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlRichTextBlock data={supportInfo} />
                    </MjmlColumn>
                </MjmlSection>
            ) : null}
            <MjmlSection>
                <MjmlColumn>
                    <MjmlSpacer height="20px" />
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    );
};
