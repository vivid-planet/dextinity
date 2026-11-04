import { Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";

interface CollapsibleSwitchButtonHeaderProps {
    checked: boolean;
    title?: ReactNode;
}

export const CollapsibleSwitchButtonHeader = ({ checked, title }: CollapsibleSwitchButtonHeaderProps) => {
    return (
        <Root>
            <Typography>{title}</Typography>
            <Switch checked={checked} />
        </Root>
    );
};

const Root = styled("div")`
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;
