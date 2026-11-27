import { composeStories, type Meta, type StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";

import * as finderStories from "../../../components/finderLayout/__stories__/FinderLayout.stories";
import * as listDetailStories from "../../../components/listDetailLayout/__stories__/ListDetailLayout.stories";
import * as listStories from "../../../components/listLayout/__stories__/ListLayout.stories";
import * as overviewStories from "../../../components/overviewLayout/__stories__/OverviewLayout.stories";
import * as treeDetailStories from "../../../components/treeDetailLayout/__stories__/TreeDetailLayout.stories";
import { CmsPrototype } from "../cmsPrototype/CmsPrototype";
import { PrototypeApp } from "../PrototypeApp";
import { careerPortalPrototype } from "../prototypes";

const careerPortalPages: Record<string, ComponentType> = {
    dashboard: composeStories(overviewStories).Default,
    "job-ads": composeStories(listStories).Default,
    "page-tree": composeStories(treeDetailStories).Default,
    assets: composeStories(finderStories).Default,
    redirects: composeStories(listDetailStories).Default,
};

function renderCareerPortalPage(pageId: string) {
    const Page = careerPortalPages[pageId];
    return Page ? <Page /> : undefined;
}

/**
 * Clickable prototypes of whole apps, to get a feel for the user experience: the navigation opens the pages, which are the live
 * examples of the page types. Open them in the workspace's Prototype tab.
 */
const meta = {
    title: "Workbench/Prototypes",
    // The story ids stay as before the rename, so that links and what the browser stored for them keep working
    id: "workspace-prototypes",
    tags: ["!autodocs", "!manifest"],
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CareerPortal: Story = {
    render: () => <PrototypeApp prototype={careerPortalPrototype} renderPage={renderCareerPortalPage} />,
};

/**
 * A classic website CMS: the page tree opens the page editor, the news list opens the article form, and the assets show their
 * details and where they are used.
 */
export const Cms: Story = {
    name: "CMS",
    render: () => <CmsPrototype />,
};
