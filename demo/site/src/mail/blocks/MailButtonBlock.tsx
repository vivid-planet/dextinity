import { MjmlButton, MjmlColumn, MjmlSection, type PropsWithData, withPreview } from "@dextinity/mail-react";
import type { MailButtonBlockData } from "@src/blocks.generated";

export const MailButtonBlock = withPreview<PropsWithData<MailButtonBlockData>>(
    ({ data, className }) => {
        return (
            <MjmlSection indent className={className}>
                <MjmlColumn>
                    <MjmlButton href={data.link.targetUrl} variant={data.variant} align={data.align}>
                        {data.text}
                    </MjmlButton>
                </MjmlColumn>
            </MjmlSection>
        );
    },
    { label: "Button" },
);
