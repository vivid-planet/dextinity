import { MjmlColumn, MjmlSection, MjmlSpacer, type PropsWithData, withPreview } from "@dextinity/mail-react";
import type { MailSpacerBlockData } from "@src/blocks.generated";

const spacingToHeight: Record<MailSpacerBlockData["spacing"], string> = {
    small: "16px",
    medium: "32px",
    large: "48px",
};

export const MailSpacerBlock = withPreview<PropsWithData<MailSpacerBlockData>>(
    ({ data, className }) => {
        return (
            <MjmlSection className={className}>
                <MjmlColumn>
                    <MjmlSpacer height={spacingToHeight[data.spacing]} />
                </MjmlColumn>
            </MjmlSection>
        );
    },
    { label: "Spacer" },
);
