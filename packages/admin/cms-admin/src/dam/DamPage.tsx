import type { ReactNode } from "react";

import { ContentScopeIndicator } from "../contentScope/ContentScopeIndicator";
import { type ContentScope, useContentScope } from "../contentScope/Provider";
import { useContentScopeConfig } from "../contentScope/useContentScopeConfig";
import { useRoutePathBelowContentScope } from "../contentScope/useRoutePathBelowContentScope";
import { useDamConfig } from "./config/damConfig";
import { DamScopeProvider } from "./config/DamScopeProvider";
import { useDamScope } from "./config/useDamScope";
import { DamTable } from "./DamTable";

type Props = {
    renderContentScopeIndicator?: (scope: ContentScope) => ReactNode;
    /**
     * @deprecated Use `additionalToolbarItems` option in `DamConfigProvider` instead
     */
    additionalToolbarItems?: ReactNode;
};

const DefaultContentScopeIndicator = () => {
    const damScope = useDamScope();

    if (Object.keys(damScope).length > 0) {
        return <ContentScopeIndicator scope={damScope} />;
    } else {
        return <ContentScopeIndicator global />;
    }
};

function DamPage({ renderContentScopeIndicator, additionalToolbarItems }: Props) {
    const { scope } = useContentScope();
    const damRouteLocation = useRoutePathBelowContentScope();
    useContentScopeConfig({ redirectPathAfterChange: damRouteLocation });
    const damConfig = useDamConfig();

    return (
        <DamScopeProvider>
            <DamTable
                contentScopeIndicator={renderContentScopeIndicator ? renderContentScopeIndicator(scope) : <DefaultContentScopeIndicator />}
                additionalToolbarItems={damConfig.additionalToolbarItems ?? additionalToolbarItems}
                renderWithFullHeightMainContent
            />
        </DamScopeProvider>
    );
}

export { DamPage };
