import { Box, Tab, Tabs, Typography } from "@mui/material";
import type { Decorator, Meta } from "@storybook/react-vite";
import { useState } from "react";

import { MasterLayoutDecorator } from "../../../.storybook/decorators/MasterLayout.decorator";
import { MainContent } from "../../common/MainContent";
import { ToolbarAutomaticTitleItem } from "../../common/toolbar/automatictitleitem/ToolbarAutomaticTitleItem";
import { Toolbar } from "../../common/toolbar/Toolbar";
import { RouterTab, RouterTabs } from "../RouterTabs";

// Make sure the story is not too tall and can be scrolled - setting the story-height in the config only affects the min-height and does not make the content scrollable
const MaxHeightDecorator: Decorator = (Story) => (
    <Box maxHeight="400px">
        <Story />
    </Box>
);

const storyConfig: Meta = {
    title: "components/tabs/Overflow Issues",
    decorators: [MaxHeightDecorator],
    parameters: {
        docs: {
            description: {
                component:
                    "This story is for debugging an issue where using certain content inside MasterLayout causes the content to overflow the page.",
            },
        },
    },
};

export default storyConfig;

const numberOfTabs = 20;

const ExampleContentBlock = () => {
    return (
        <Box
            sx={(theme) => ({
                width: 200,
                height: "150vh",
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.grey[100],
            })}
        />
    );
};

export const RouterTabsInMasterContent = {
    decorators: [MasterLayoutDecorator],
    parameters: {
        layout: "none",
        stack: { topLevelTitle: "Example Page" },
    },
    render: () => {
        return (
            <MainContent>
                <RouterTabs>
                    {Array.from({ length: numberOfTabs }, (_, index) => (
                        <RouterTab key={index} path={index === 0 ? "" : `/lorem-ipsum-${index + 1}`} label={`Lorem ipsum ${index + 1}`}>
                            <Typography variant="h2" gutterBottom>
                                Lorem ipsum {index + 1}
                            </Typography>
                            <ExampleContentBlock />
                        </RouterTab>
                    ))}
                </RouterTabs>
            </MainContent>
        );
    },
};

export const RouterTabsInMasterContentWithToolbar = {
    decorators: [MasterLayoutDecorator],
    parameters: {
        layout: "none",
        stack: { topLevelTitle: "Example Page" },
    },
    render: () => {
        return (
            <>
                <Toolbar>
                    <ToolbarAutomaticTitleItem />
                </Toolbar>
                <MainContent>
                    <RouterTabs>
                        {Array.from({ length: numberOfTabs }, (_, index) => (
                            <RouterTab key={index} path={index === 0 ? "" : `/lorem-ipsum-${index + 1}`} label={`Lorem ipsum ${index + 1}`}>
                                <Typography variant="h2" gutterBottom>
                                    Lorem ipsum {index + 1}
                                </Typography>
                                <ExampleContentBlock />
                            </RouterTab>
                        ))}
                    </RouterTabs>
                </MainContent>
            </>
        );
    },
};

export const MuiTabsInMasterContent = {
    decorators: [MasterLayoutDecorator],
    parameters: {
        layout: "none",
        stack: { topLevelTitle: "Example Page" },
    },
    render: () => {
        const [activeTabIndex, setActiveTabIndex] = useState(0);

        return (
            <MainContent>
                <Tabs variant="scrollable" value={activeTabIndex} onChange={(_, index) => setActiveTabIndex(index)}>
                    {Array.from({ length: numberOfTabs }, (_, index) => (
                        <Tab key={index} label={`Lorem ipsum ${index + 1}`} />
                    ))}
                </Tabs>
                <ExampleContentBlock />
            </MainContent>
        );
    },
};

export const MuiTabsInMasterContentWithToolbar = {
    decorators: [MasterLayoutDecorator],
    parameters: {
        layout: "none",
        stack: { topLevelTitle: "Example Page" },
    },
    render: () => {
        const [activeTabIndex, setActiveTabIndex] = useState(0);

        return (
            <>
                <Toolbar>
                    <ToolbarAutomaticTitleItem />
                </Toolbar>
                <MainContent>
                    <Tabs variant="scrollable" value={activeTabIndex} onChange={(_, index) => setActiveTabIndex(index)}>
                        {Array.from({ length: numberOfTabs }, (_, index) => (
                            <Tab key={index} label={`Lorem ipsum ${index + 1}`} />
                        ))}
                    </Tabs>
                    <ExampleContentBlock />
                </MainContent>
            </>
        );
    },
};

export const RouterTabsInMainContent = {
    parameters: {
        layout: "none",
        stack: { topLevelTitle: "Example Page" },
    },
    render: () => {
        return (
            <MainContent>
                <RouterTabs>
                    {Array.from({ length: numberOfTabs }, (_, index) => (
                        <RouterTab key={index} path={index === 0 ? "" : `/lorem-ipsum-${index + 1}`} label={`Lorem ipsum ${index + 1}`}>
                            <Typography variant="h2" gutterBottom>
                                Lorem ipsum {index + 1}
                            </Typography>
                            <ExampleContentBlock />
                        </RouterTab>
                    ))}
                </RouterTabs>
            </MainContent>
        );
    },
};

export const MuiTabsInMainContent = {
    parameters: {
        layout: "none",
    },
    render: () => {
        const [activeTabIndex, setActiveTabIndex] = useState(0);

        return (
            <MainContent>
                <Tabs variant="scrollable" value={activeTabIndex} onChange={(_, index) => setActiveTabIndex(index)}>
                    {Array.from({ length: numberOfTabs }, (_, index) => (
                        <Tab key={index} label={`Lorem ipsum ${index + 1}`} />
                    ))}
                </Tabs>
                <ExampleContentBlock />
            </MainContent>
        );
    },
};
