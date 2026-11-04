import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage, useIntl } from "react-intl";

import type { GQLSendingState } from "../graphql.generated";

interface Props {
    sendingState?: GQLSendingState;
}

export const SendingStateColumn = ({ sendingState }: Props) => {
    const intl = useIntl();

    return (
        <Root>
            {sendingState === "SENT" && (
                <>
                    <DeliveredIndicator title={intl.formatMessage({ id: "dextinity.emailCampaigns.sendingState.sent", defaultMessage: "Sent" })} />
                    <Typography variant="body2">
                        <FormattedMessage id="dextinity.emailCampaigns.sendingState.sent" defaultMessage="Sent" />
                    </Typography>
                </>
            )}
            {sendingState === "SCHEDULED" && (
                <>
                    <ScheduledIndicator
                        title={intl.formatMessage({ id: "dextinity.emailCampaigns.sendingState.scheduled", defaultMessage: "Scheduled" })}
                    />
                    <Typography variant="body2">
                        <FormattedMessage id="dextinity.emailCampaigns.sendingState.scheduled" defaultMessage="Scheduled" />
                    </Typography>
                </>
            )}
            {sendingState === "DRAFT" && (
                <>
                    <DraftIndicator title={intl.formatMessage({ id: "dextinity.emailCampaigns.draft", defaultMessage: "Draft" })} />
                    <Typography variant="body2">
                        <FormattedMessage id="dextinity.emailCampaigns.sendingState.draft" defaultMessage="Draft" />
                    </Typography>
                </>
            )}
        </Root>
    );
};

const Root = styled("div")`
    display: flex;
    align-items: center;
`;

const AbstractIndicator = styled("div")`
    width: 14px;
    height: 14px;
    border-radius: 7px;
    margin-right: 11px;
`;

const DeliveredIndicator = styled(AbstractIndicator)`
    background-color: ${({ theme }) => theme.palette.success.main};
`;

const ScheduledIndicator = styled(AbstractIndicator)`
    border: ${({ theme }) => `2px solid ${theme.palette.action.active}`};
`;

const DraftIndicator = styled(AbstractIndicator)`
    border: ${({ theme }) => `2px solid ${theme.palette.warning.main}`};
`;
