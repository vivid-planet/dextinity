import { Avatar, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Root = styled(Box)`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
`;

interface AvatarStyleProps {
    backgroundColor?: string;
}

export const AvatarStyled = styled(Avatar, { shouldForwardProp: (prop) => prop !== "backgroundColor" })<AvatarStyleProps>`
    background-color: ${({ backgroundColor }) => {
        return backgroundColor;
    }};
`;
