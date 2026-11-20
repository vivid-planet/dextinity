import { composeStories, type Meta, type StoryObj } from "@storybook/react-vite";
import { type ComponentType, useEffect, useState } from "react";

import { EmptyState } from "../../../components/emptyState/EmptyState";
import * as finderStories from "../../../components/finderLayout/__stories__/FinderLayout.stories";
import { Icon } from "../../../components/icon/Icon";
import * as listDetailStories from "../../../components/listDetailLayout/__stories__/ListDetailLayout.stories";
import * as listStories from "../../../components/listLayout/__stories__/ListLayout.stories";
import * as overviewStories from "../../../components/overviewLayout/__stories__/OverviewLayout.stories";
import * as treeDetailStories from "../../../components/treeDetailLayout/__stories__/TreeDetailLayout.stories";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { PrototypeNavigationContext } from "../../pageTypes/prototypeNavigation";
import { careerPortalPrototype } from "../prototypes";

const { appName, startPageId, getPageLabel } = careerPortalPrototype;

const pages: Record<string, ComponentType> = {
    dashboard: composeStories(overviewStories).Default,
    "job-ads": composeStories(listStories).Default,
    "page-tree": composeStories(treeDetailStories).Default,
    assets: composeStories(finderStories).Default,
    redirects: composeStories(listDetailStories).Default,
};

// The page is the location's hash, so a reload keeps it and the browser's back button goes to the page before
function readPageId() {
    const id = window.location.hash.slice(1);
    return getPageLabel(id) != null ? id : startPageId;
}

function PageNotInPrototype({ id }: { id: string }) {
    return (
        <PageTypeShell currentId={id}>
            <EmptyState
                icon={<Icon name="window" />}
                title={`${getPageLabel(id)} isn't part of the prototype yet`}
                description={`The navigation works; this page has no design yet. Pages with a design: ${careerPortalPrototype.designedPageIds.map(getPageLabel).join(", ")}.`}
            />
        </PageTypeShell>
    );
}

function CareerPortalPrototype() {
    const [pageId, setPageId] = useState(readPageId);
    const [navCollapsed, setNavCollapsed] = useState(false);

    useEffect(() => {
        const handleHashChange = () => setPageId(readPageId());
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    useEffect(() => {
        document.title = `${getPageLabel(pageId)} · ${appName}`;
    }, [pageId]);

    const Page = pages[pageId];

    return (
        <PrototypeNavigationContext.Provider
            value={{
                navigate: (id) => {
                    window.location.hash = id;
                },
                navCollapsed,
                onNavCollapsedChange: setNavCollapsed,
            }}
        >
            {Page ? <Page key={pageId} /> : <PageNotInPrototype key={pageId} id={pageId} />}
        </PrototypeNavigationContext.Provider>
    );
}

/**
 * Clickable prototypes of whole apps, to get a feel for the user experience: the navigation opens the pages, which are the live
 * examples of the page types. Open them in the workspace's Prototype tab.
 */
const meta = {
    title: "Workspace/Prototypes",
    tags: ["!autodocs", "!manifest"],
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CareerPortal: Story = {
    render: () => <CareerPortalPrototype />,
};
