import { createContext, type PropsWithChildren, useContext, useState } from "react";

import { applyScenario, getCopyId, lengthen, type Scenario } from "../../scenario";
import { type SitePage, siteTree } from "./cmsData";

export interface Redirect {
    id: string;
    source: string;
    target: string;
    type: "automatic" | "manual";
    comment: string;
    created: string;
}

const initialRedirects: Redirect[] = [
    { id: "redirect-1", source: "/company", target: "/about-us", type: "manual", comment: "Old navigation", created: "12 Mar 2026" },
    { id: "redirect-2", source: "/team", target: "/about-us/team", type: "manual", comment: "Campaign link", created: "2 Jun 2026" },
];

function copyPages(pages: SitePage[], round: number): SitePage[] {
    return pages.map((page) => ({ ...page, id: getCopyId(page.id, round), children: page.children && copyPages(page.children, round) }));
}

function stretchPages(pages: SitePage[]): SitePage[] {
    return pages.map((page) => ({ ...page, label: lengthen(page.label), children: page.children && stretchPages(page.children) }));
}

function scenarioPages(scenario: Scenario) {
    // The tree has a single root, so a few pages are a few below it
    if (scenario === "few") {
        return siteTree.map((root) => ({ ...root, children: root.children?.slice(0, 2).map((page) => ({ ...page, children: undefined })) }));
    }
    return applyScenario(siteTree, scenario, {
        copy: (page, round) => ({ ...copyPages([page], round)[0], label: `${page.label} (${round + 1})` }),
        stretch: (page) => stretchPages([page])[0],
    });
}

interface CmsSite {
    pages: SitePage[];
    setPages: (pages: SitePage[] | ((pages: SitePage[]) => SitePage[])) => void;
    redirects: Redirect[];
    setRedirects: (redirects: Redirect[] | ((redirects: Redirect[]) => Redirect[])) => void;
}

const CmsSiteContext = createContext<CmsSite | null>(null);

/**
 * Keeps the page tree and its redirects together while moving between the pages of the prototype, so that a page moved in the tree
 * still matches the redirect that moving it created.
 */
export function CmsSiteProvider({ scenario, children }: PropsWithChildren<{ scenario: Scenario }>) {
    const [pages, setPages] = useState(() => scenarioPages(scenario));
    const [redirects, setRedirects] = useState(initialRedirects);
    return <CmsSiteContext.Provider value={{ pages, setPages, redirects, setRedirects }}>{children}</CmsSiteContext.Provider>;
}

export function useCmsSite() {
    const site = useContext(CmsSiteContext);
    if (site == null) {
        throw new Error("useCmsSite needs a CmsSiteProvider around it.");
    }
    return site;
}
