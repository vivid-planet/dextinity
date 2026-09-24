import type { JSX, ReactNode } from "react";

import { ContentScopeSelect } from "./ContentScopeSelect";
import { type ContentScope, type ContentScopeValues, useContentScope } from "./Provider";

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
            groupBy={groupBy ?? getSharedDimension(values)}
        />
    );
}

// The current scope's own shape isn't representative of all available scopes, so a fallback dimension
// is only safe to pick when every scope shares the exact same set of dimensions.
function getSharedDimension(values: ContentScopeValues): keyof ContentScope | undefined {
    const [first, ...rest] = values;
    if (!first) {
        return undefined;
    }

    const dimensions = Object.keys(first.scope);
    const allScopesShareDimensions = rest.every((value) => {
        const otherDimensions = Object.keys(value.scope);
        return otherDimensions.length === dimensions.length && dimensions.every((dimension) => otherDimensions.includes(dimension));
    });

    return allScopesShareDimensions ? dimensions[0] : undefined;
}
