import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Root = styled(Box)`
    padding: ${({ theme }) => theme.spacing(8)};
`;
