import type { JSX, ReactNode } from "react";

import { ContentScopeSelect } from "./ContentScopeSelect";
import { type ContentScope, useContentScope } from "./Provider";

interface ContentScopeControlsProps {
    searchable?: boolean;
    groupBy?: keyof ContentScope;
    icon?: ReactNode;
}

// A standard control form for scope
// Can be easily configured (should fit for 90% of all cases)
export function ContentScopeControls({ searchable = true, icon, groupBy }: ContentScopeControlsProps): JSX.Element {
    const { scope, setScope, values } = useContentScope();
    return (
        <ContentScopeSelect
            value={scope}
            onChange={(value) => setScope(() => value)}
            options={values}
            searchable={searchable}
            icon={icon}
            groupBy={groupBy ?? Object.keys(scope)[0]}
        />
    );
}
