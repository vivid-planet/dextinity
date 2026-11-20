import { Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Root = styled(Box)`
    padding: ${({ theme }) => theme.spacing(8)};
`;

export const PaperStyled = styled(Paper)`
    padding: ${({ theme }) => theme.spacing(1)};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

export const LoadingContainer = styled(Box)`
    display: flex;
    min-height: 100px;
    justify-content: center;
    align-items: center;
`;
