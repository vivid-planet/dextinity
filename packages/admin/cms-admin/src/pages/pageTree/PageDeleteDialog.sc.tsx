import { Warning } from "@dextinity/admin-icons";
import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

export const DeleteContentInformation = styled(Paper)`
    border: 1px solid ${({ theme }) => theme.palette.error.main};
    border-radius: 3px;
    margin-bottom: 20px;
`;

export const WarningIconWrapper = styled("div")`
    color: ${({ theme }) => theme.palette.error.main};
    margin-right: 15px;
`;

export const WarningIcon = styled(Warning)`
    vertical-align: middle;
`;

export const PageVisibility = styled("div")`
    display: flex;
    align-items: center;
    flex: 1;

    & :first-of-type {
        margin-right: 5px;
    }
`;

export const PageCount = styled("div")`
    display: flex;
    color: ${({ theme }) => theme.palette.error.main};
    flex: 1;
    align-items: center;
    justify-content: flex-end;

    & :last-child {
        margin-left: 5px;
    }
`;
