"use client";

import { createContext, type PropsWithChildren, useContext } from "react";

import type { PredefinedPage } from "./predefinedPages";

const PredefinedPagesContext = createContext<PredefinedPage[] | undefined>(undefined);

export function PredefinedPagesProvider({ predefinedPages, children }: PropsWithChildren<{ predefinedPages: PredefinedPage[] }>) {
    return <PredefinedPagesContext.Provider value={predefinedPages}>{children}</PredefinedPagesContext.Provider>;
}

export function usePredefinedPages() {
    const predefinedPages = useContext(PredefinedPagesContext);

    if (!predefinedPages) {
        throw new Error("usePredefinedPages must be used within a PredefinedPagesProvider");
    }

    return predefinedPages;
}
