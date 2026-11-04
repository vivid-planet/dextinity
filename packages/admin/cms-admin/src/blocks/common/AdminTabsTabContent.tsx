import { styled } from "@mui/material/styles";
import type { PropsWithChildren } from "react";

import { useScrollRestoration } from "./useScrollRestoration";

interface TabContentProps {
    selectedTab?: string;
}

export const TabContent = ({ children, selectedTab }: PropsWithChildren<TabContentProps>) => {
    const scrollRestoration = useScrollRestoration<HTMLDivElement>(`adminTabsTabContent-${selectedTab}`);
    return (
        <Root {...scrollRestoration}>
            <Content>{children}</Content>
        </Root>
    );
};

const Root = styled("div")`
    overflow-y: auto;
    overflow-x: hidden;
`;

const Content = styled("div")`
    margin-top: ${({ theme }) => theme.spacing(4)};
    margin-bottom: ${({ theme }) => theme.spacing(4)};

    & > .DextinityAdminStackBreadcrumbs-root:first-of-type {
        margin-top: -${({ theme }) => theme.spacing(4)};
    }
`;
