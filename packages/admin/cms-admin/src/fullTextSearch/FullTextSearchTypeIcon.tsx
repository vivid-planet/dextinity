import { Document, Image, Link, News, PageTree, Tag } from "@dextinity/admin-icons";
import type { SvgIconProps } from "@mui/material";
import type { ComponentType } from "react";

import type { FullTextSearchType } from "./useFullTextSearchTypeSettings";

const iconsByTypeOrEntityName: Record<string, ComponentType<SvgIconProps>> = {
    PageTreeNode: PageTree,
    News,
    Product: Tag,
    DamFile: Image,
    Redirect: Link,
};

interface FullTextSearchTypeIconProps extends SvgIconProps {
    searchType: FullTextSearchType;
}

export function FullTextSearchTypeIcon({ searchType, ...iconProps }: FullTextSearchTypeIconProps) {
    const Icon = iconsByTypeOrEntityName[searchType.entityName] ?? iconsByTypeOrEntityName[searchType.type] ?? Document;

    return <Icon {...iconProps} />;
}
