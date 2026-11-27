import { composeStories } from "@storybook/react-vite";
import type { ComponentType } from "react";

import * as editStories from "../../components/editLayout/__stories__/EditLayout.stories";
import { EmptyState } from "../../components/emptyState/EmptyState";
import * as finderStories from "../../components/finderLayout/__stories__/FinderLayout.stories";
import { Icon } from "../../components/icon/Icon";
import * as listDetailStories from "../../components/listDetailLayout/__stories__/ListDetailLayout.stories";
import * as listStories from "../../components/listLayout/__stories__/ListLayout.stories";
import * as overviewStories from "../../components/overviewLayout/__stories__/OverviewLayout.stories";
import * as treeDetailStories from "../../components/treeDetailLayout/__stories__/TreeDetailLayout.stories";
import { PageTypeShell } from "../pageTypes/PageTypeShell";
import { createStoredList } from "./workspaceNotes";

export type PageTemplate = "overview" | "list" | "listDetail" | "treeDetail" | "finder" | "editor" | "empty";

/** A page a designer added to a prototype, from one of the page types, to try out a page the prototype doesn't have yet. */
export interface CustomPage {
    /** The page's id in the prototype's hash, always starting with `new/`. */
    id: string;
    prototypeId: string;
    template: PageTemplate;
    title: string;
}

export const customPagePrefix = "new/";

export const customPageList = createStoredList<CustomPage>("dextinity-ui-workspace-custom-pages");

function EmptyPage() {
    return (
        <PageTypeShell currentId="">
            <EmptyState icon={<Icon name="window" />} title="An empty page" description="Pin comments or edit texts to sketch what goes here." />
        </PageTypeShell>
    );
}

export const pageTemplates: Array<{ value: PageTemplate; label: string; Page: ComponentType }> = [
    { value: "overview", label: "Overview", Page: composeStories(overviewStories).Default },
    { value: "list", label: "List", Page: composeStories(listStories).Default },
    { value: "listDetail", label: "List with detail", Page: composeStories(listDetailStories).Default },
    { value: "treeDetail", label: "Tree with detail", Page: composeStories(treeDetailStories).Default },
    { value: "finder", label: "Finder", Page: composeStories(finderStories).Default },
    { value: "editor", label: "Form", Page: composeStories(editStories).Form },
    { value: "empty", label: "Empty page", Page: EmptyPage },
];

export function renderCustomPage(page: CustomPage) {
    const Page = pageTemplates.find((template) => template.value === page.template)?.Page ?? EmptyPage;
    return <Page />;
}
