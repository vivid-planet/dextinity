import { MjmlColumn, MjmlDivider, MjmlSection } from "@dextinity/mail-react";

export const MailDividerBlock = () => {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlDivider />
            </MjmlColumn>
        </MjmlSection>
    );
};
