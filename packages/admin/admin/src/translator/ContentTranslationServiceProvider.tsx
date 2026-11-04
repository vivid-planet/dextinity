import type { PropsWithChildren } from "react";

import { ContentTranslationServiceContext } from "./ContentTranslationServiceContext";

export const ContentTranslationServiceProvider = ({
    children,
    enabled,
    showApplyTranslationDialog,
    translate,
    batchTranslate,
}: PropsWithChildren<ContentTranslationServiceContext>) => {
    return (
        <ContentTranslationServiceContext.Provider value={{ enabled, showApplyTranslationDialog, translate, batchTranslate }}>
            {children}
        </ContentTranslationServiceContext.Provider>
    );
};
