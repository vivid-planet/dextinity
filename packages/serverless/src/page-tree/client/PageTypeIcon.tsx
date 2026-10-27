import { Home, HomeNotMenu } from "@dextinity/admin-icons";
import { styled } from "@mui/material/styles";

import type { PageTreeNodeItem } from "./pageTreeApi.types.js";
import { usePageTreeApi } from "./PageTreeApiProvider.js";

export function PageTypeIcon({ node }: { node: PageTreeNodeItem }) {
    const { documentTypes } = usePageTreeApi();
    const documentType = documentTypes[node.documentType];
    const isPublished = node.visibility === "Published";

    let icon;
    if (node.slug === "home") {
        icon = node.hideInMenu ? <HomeNotMenu /> : <Home />;
    } else {
        icon = node.hideInMenu ? (documentType?.hideInMenuIcon ?? documentType?.icon) : documentType?.icon;
    }

    return <IconWrapper isPublished={isPublished}>{icon}</IconWrapper>;
}

const IconWrapper = styled("span", { shouldForwardProp: (prop) => prop !== "isPublished" })<{ isPublished: boolean }>`
    display: inline-flex;
    color: ${({ theme, isPublished }) => (isPublished ? theme.palette.primary.main : theme.palette.text.disabled)};
`;
