import { MjmlButton, MjmlColumn, MjmlSection, type PropsWithData } from "@dextinity/mail-react";
import type { MailButtonBlockData } from "@src/blocks.generated";

export const MailButtonBlock = ({ data }: PropsWithData<MailButtonBlockData>) => {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlButton href={data.link.targetUrl} variant={data.variant} align={data.align}>
                    {data.text}
                </MjmlButton>
            </MjmlColumn>
        </MjmlSection>
    );
};
