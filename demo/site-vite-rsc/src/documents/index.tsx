import { Page } from "@src/documents/pages/Page";
import type { GQLPageTreeNodeScopeInput } from "@src/graphql.generated";
import type { ReactNode } from "react";

import { Link } from "./links/Link";

type DocumentProps = { pageTreeNodeId: string; scope: GQLPageTreeNodeScopeInput };

type DocumentType = {
    component: (props: DocumentProps) => Promise<ReactNode>;
};

export const documentTypes: Record<string, DocumentType> = {
    Page: {
        component: Page,
    },
    Link: {
        component: Link,
    },
};
