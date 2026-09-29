import { AddNoCircle } from "@dextinity/admin-icons";
import { ButtonBase, type ButtonBaseProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const Root = styled(ButtonBase)`
    position: relative;
    z-index: 11;
    padding: 4px;
    border-radius: 12px;
    background-color: #fff;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    box-shadow: ${({ theme }) => theme.shadows[1]};
    font-size: 0; // Hides non-breaking-space after icon

    &:hover {
        background-color: ${({ theme }) => theme.palette.primary.main};
        border-color: ${({ theme }) => theme.palette.primary.main};
        color: #fff;
    }
`;

export const InsertInBetweenActionButton = (props: ButtonBaseProps) => {
    return (
        <Root {...props}>
            <AddNoCircle color="inherit" />
        </Root>
    );
};
