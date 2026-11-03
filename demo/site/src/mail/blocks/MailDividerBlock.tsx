import { MjmlColumn, MjmlDivider, MjmlSection, type PropsWithData, withPreview } from "@dextinity/mail-react";
import type { MailDividerBlockData } from "@src/blocks.generated";

export const MailDividerBlock = withPreview<PropsWithData<MailDividerBlockData>>(
    ({ className }) => {
        return (
            <MjmlSection indent className={className}>
                <MjmlColumn>
                    <MjmlDivider />
                </MjmlColumn>
            </MjmlSection>
        );
    },
    { label: "Divider" },
);
