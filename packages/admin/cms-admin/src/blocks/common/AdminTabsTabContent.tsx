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
    padding-block: var(--dextinity-space-4);
`;
