import { generateMetadata as generateMetadataPage, Page } from "@src/documents/pages/Page";

import { Link } from "./links/Link";

// TODO fix type for async component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DocumentType = any; //{ component: React.ComponentType<{ pageTreeNodeId: string; scope: GQLPageTreeNodeScopeInput }> };

export const documentTypes: Record<string, DocumentType> = {
    Page: {
        component: Page,
        generateMetadata: generateMetadataPage,
    },
    Link: {
        component: Link,
    },
};
