import { createContext, type PropsWithChildren, useContext, useState } from "react";

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

interface CmsSite {
    redirects: Redirect[];
    setRedirects: (redirects: Redirect[] | ((redirects: Redirect[]) => Redirect[])) => void;
}

const CmsSiteContext = createContext<CmsSite | null>(null);

/** Keeps the redirects while moving between the pages of the prototype, e.g. from the page tree, which creates them, to the redirects. */
export function CmsSiteProvider({ children }: PropsWithChildren) {
    const [redirects, setRedirects] = useState(initialRedirects);
    return <CmsSiteContext.Provider value={{ redirects, setRedirects }}>{children}</CmsSiteContext.Provider>;
}

export function useCmsSite() {
    const site = useContext(CmsSiteContext);
    if (site == null) {
        throw new Error("useCmsSite needs a CmsSiteProvider around it.");
    }
    return site;
}
