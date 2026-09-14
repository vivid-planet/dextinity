import { useDextinityConfig } from "../../config/DextinityConfigContext";
import { type ContentScope, useContentScope } from "../../contentScope/Provider";

export function usePageTreeScope(): Partial<ContentScope> {
    const { pageTree } = useDextinityConfig();
    const { scope: completeScope } = useContentScope();

    if (pageTree?.scopeParts) {
        const pageTreeScope = pageTree.scopeParts.reduce((pageTreeScope, dimension) => {
            if (completeScope[dimension] !== undefined) {
                pageTreeScope[dimension] = completeScope[dimension];
            }
            return pageTreeScope;
        }, {} as Partial<ContentScope>);

        return pageTreeScope;
    }

    return completeScope;
}
