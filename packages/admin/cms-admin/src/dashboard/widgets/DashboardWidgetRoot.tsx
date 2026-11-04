import { Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";

export type DashboardWidgetRootProps = PropsWithChildren<{
    header: ReactNode;
    icon?: ReactNode;
}>;

export const DashboardWidgetRoot = ({ header, icon, children }: DashboardWidgetRootProps) => {
    return (
        <Paper square={false} sx={{ borderRadius: 2 }}>
            <HeaderWrapper>
                {icon}
                <Typography variant="h5">{header}</Typography>
            </HeaderWrapper>
            {children}
        </Paper>
    );
};

const HeaderWrapper = styled("div")`
    padding: 16px;
    background-color: ${({ theme }) => theme.palette.grey["A200"]};
    color: white;
    display: flex;
    gap: 10px;
    align-items: center;
    border-radius: 4px 4px 0 0;
`;
