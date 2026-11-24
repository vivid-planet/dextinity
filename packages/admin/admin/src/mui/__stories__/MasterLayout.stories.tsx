import { Close, Dashboard, Info } from "@dextinity/admin-icons";
import { Card, CardContent, Collapse, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { createContext, type PropsWithChildren, useContext, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { AppHeader } from "../../appHeader/AppHeader";
import { AppHeaderButton } from "../../appHeader/button/AppHeaderButton";
import { AppHeaderMenuButton } from "../../appHeader/menuButton/AppHeaderMenuButton";
import { FillSpace } from "../../common/FillSpace";
import { MainContent } from "../../common/MainContent";
import { MainNavigationItemRouterLink } from "../mainNavigation/ItemRouterLink";
import { MainNavigation } from "../mainNavigation/MainNavigation";
import { MasterLayout } from "../MasterLayout";
import { MasterLayoutContext } from "../MasterLayoutContext";

export default {
    title: "components/mui/MasterLayout",
    parameters: { layout: "fullscreen" },
};

const sidePanelWidth = 320;

const HelpPanelContext = createContext<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void }>({
    isOpen: false,
    setIsOpen: () => undefined,
});

function HelpPanelProvider({ children }: PropsWithChildren) {
    const [isOpen, setIsOpen] = useState(false);
    return <HelpPanelContext.Provider value={{ isOpen, setIsOpen }}>{children}</HelpPanelContext.Provider>;
}

function Menu() {
    return (
        <MainNavigation>
            <MainNavigationItemRouterLink primary="Dashboard" icon={<Dashboard />} to="/" />
        </MainNavigation>
    );
}

function Header() {
    const { isOpen, setIsOpen } = useContext(HelpPanelContext);

    return (
        <AppHeader>
            <AppHeaderMenuButton />
            <FillSpace />
            <AppHeaderButton startIcon={<Info />} onClick={() => setIsOpen(!isOpen)}>
                Help
            </AppHeaderButton>
        </AppHeader>
    );
}

// Animates its own width, so that the content shrinks along with it, and stays below the header while the page scrolls.
function HelpPanel() {
    const { isOpen, setIsOpen } = useContext(HelpPanelContext);
    const { headerHeight } = useContext(MasterLayoutContext);

    return (
        <StickyCollapse in={isOpen} orientation="horizontal" style={{ top: headerHeight, height: `calc(100vh - ${headerHeight}px)` }}>
            <HelpPanelContent aria-label="Help">
                <IconButton aria-label="Close help" onClick={() => setIsOpen(false)} sx={{ float: "right" }}>
                    <Close />
                </IconButton>
                <Typography variant="h3" gutterBottom>
                    Help
                </Typography>
                <Typography>A side panel takes its width from the content next to it, instead of covering it.</Typography>
            </HelpPanelContent>
        </StickyCollapse>
    );
}

const StickyCollapse = styled(Collapse)`
    position: sticky;
`;

const HelpPanelContent = styled("aside")(({ theme }) => ({
    boxSizing: "border-box",
    width: sidePanelWidth,
    height: "100%",
    padding: theme.spacing(4),
    borderLeft: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
}));

export const SidePanel = {
    render: () => (
        <HelpPanelProvider>
            <MasterLayout headerComponent={Header} menuComponent={Menu} sidePanelComponent={HelpPanel}>
                <MainContent>
                    <Card variant="outlined" data-testid="content">
                        <CardContent>
                            <Typography variant="h1" gutterBottom>
                                Content
                            </Typography>
                            <Typography>The content narrows while the help next to it is open.</Typography>
                        </CardContent>
                    </Card>
                </MainContent>
            </MasterLayout>
        </HelpPanelProvider>
    ),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);
        const content = canvas.getByTestId("content");
        const closedWidth = content.getBoundingClientRect().width;

        await userEvent.click(canvas.getByRole("button", { name: "Help" }));

        await waitFor(() => expect(content.getBoundingClientRect().width).toBeCloseTo(closedWidth - sidePanelWidth, 0));

        await userEvent.click(canvas.getByRole("button", { name: "Close help" }));

        await waitFor(() => expect(content.getBoundingClientRect().width).toBeCloseTo(closedWidth, 0));
    },
};
