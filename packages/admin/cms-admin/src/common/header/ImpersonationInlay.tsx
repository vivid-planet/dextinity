import { Reset } from "@dextinity/admin-icons";
import { Box, Chip, Typography } from "@mui/material";
import { css, styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { useCurrentUser } from "../../userPermissions/hooks/currentUser";
import { StopImpersonationButton } from "../../userPermissions/user/ImpersonationButtons";

export function ImpersonationInlay() {
    const user = useCurrentUser();

    return (
        <Root>
            <Chip color="primary" label={<FormattedMessage id="dextinity.impersonation.inlay.title" defaultMessage="Impersonation Mode" />} />
            <TextContainer>
                <Name variant="h6">{user.name}</Name>
                <SingleLineTypography variant="body2">{user.email}</SingleLineTypography>
            </TextContainer>
            <StopImpersonationButton startIcon={<Reset />} variant="contained" color="secondary" />
        </Root>
    );
}

const Root = styled(Box)(
    ({ theme }) => css`
        display: flex;
        gap: ${theme.spacing(3)};
        background-color: ${theme.palette.grey[50]};
        align-items: start;
        justify-content: center;
        flex-direction: column;
        border-left: 2px solid;
        border-right: 2px solid;
        border-color: ${theme.palette.primary.main};
        padding: ${theme.spacing(4)};
    `,
);

const TextContainer = styled(Box)`
    width: 100%;
    min-width: 0;
`;

const SingleLineTypography = styled(Typography)`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;

const Name = styled(SingleLineTypography)`
    font-weight: 600;
    text-transform: none;
`;
