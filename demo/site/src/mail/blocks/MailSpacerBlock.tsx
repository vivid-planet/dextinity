import { MjmlColumn, MjmlSection, MjmlSpacer, type PropsWithData } from "@dextinity/mail-react";
import type { MailSpacerBlockData } from "@src/blocks.generated";

const spacingToHeight: Record<MailSpacerBlockData["spacing"], string> = {
    small: "16px",
    medium: "32px",
    large: "48px",
};

export const MailSpacerBlock = ({ data }: PropsWithData<MailSpacerBlockData>) => {
    return (
        <MjmlSection>
            <MjmlColumn>
                <MjmlSpacer height={spacingToHeight[data.spacing]} />
            </MjmlColumn>
        </MjmlSection>
    );
};
