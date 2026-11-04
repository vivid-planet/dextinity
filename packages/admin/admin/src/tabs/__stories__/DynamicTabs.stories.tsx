import { Typography } from "@mui/material";
import { useState } from "react";

import { Button } from "../../common/buttons/Button";
import { RouterTab, RouterTabs } from "../RouterTabs";
import { Tab, Tabs } from "../Tabs";

export const DynamicRouterTabs = ({ showFourthTab }: { showFourthTab: boolean }) => {
    const content = ["Two", "Three"];

    return (
        <RouterTabs>
            <RouterTab label="One" path="">
                One
            </RouterTab>
            {content.map((value) => (
                <RouterTab key={value} label={value} path={`/${value}`}>
                    {value}
                </RouterTab>
            ))}
            {showFourthTab && (
                <RouterTab label="Four" path="/four">
                    Four
                </RouterTab>
            )}
        </RouterTabs>
    );
};

export const DynamicTabs = ({ showFourthTab }: { showFourthTab: boolean }) => {
    const content = ["Two", "Three"];

    return (
        <Tabs>
            <Tab label="One">One</Tab>
            {content.map((value) => (
                <Tab key={value} label={value}>
                    {value}
                </Tab>
            ))}
            {showFourthTab && <Tab label="Four">Four</Tab>}
        </Tabs>
    );
};

export default {
    title: "components/tabs/Dynamic Tabs",
    excludeStories: ["DynamicRouterTabs", "DynamicTabs"],
};

export const DynamicTabsAndRouterTabs = {
    render: () => {
        const [showFourthTab, setShowFourthTab] = useState(false);

        return (
            <>
                <Button onClick={() => setShowFourthTab((show) => !show)}>{showFourthTab ? "Hide" : "Show"} fourth tab</Button>

                <Typography py={4} variant="h2">
                    Tabs:
                </Typography>
                <DynamicTabs showFourthTab={showFourthTab} />

                <Typography py={4} variant="h2">
                    RouterTabs:
                </Typography>
                <DynamicRouterTabs showFourthTab={showFourthTab} />
            </>
        );
    },

    name: "Dynamic Tabs and RouterTabs",
};
