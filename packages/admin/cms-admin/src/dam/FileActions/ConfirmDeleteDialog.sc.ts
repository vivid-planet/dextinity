import { Warning } from "@dextinity/admin-icons";
import { DialogContent, type Theme } from "@mui/material";
import { styled } from "@mui/material/styles";

export const ConfirmDialogContent = styled(DialogContent)`
    font-size: 16px;
`;

export const WarningWrapper = styled("div")`
    display: flex;
    background: ${({ theme }: { theme: Theme }) => theme.palette.common.white};
    border: ${({ theme }: { theme: Theme }) => theme.palette.error.main} solid 1px;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 40px;
`;

export const WarningIcon = styled(Warning)`
    font-size: 20px;
    color: ${({ theme }: { theme: Theme }) => theme.palette.error.dark};
`;

export const WarningTextWrapper = styled("div")`
    padding-left: 10px;
`;

export const WarningHeading = styled("h3")`
    font-size: 16px;
    margin: 0;
`;

export const WarningText = styled("p")`
    margin: 5px 0 0;
`;
