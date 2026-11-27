import { Document } from "@dextinity/admin-icons";
import type { SvgIconProps } from "@mui/material";

import { useDextinityConfig } from "../config/DextinityConfigContext";
import { useEntitiesConfig } from "../entities/entitiesConfig";
import type { FullTextSearchType } from "./useFullTextSearchTypes";

interface FullTextSearchTypeIconProps extends SvgIconProps {
    searchType: Pick<FullTextSearchType, "type" | "entityName">;
}

export function FullTextSearchTypeIcon({ searchType: { type, entityName }, ...iconProps }: FullTextSearchTypeIconProps) {
    const entities = useEntitiesConfig();
    const { pageTree } = useDextinityConfig();
    const Icon = entities[type]?.icon ?? pageTree?.documentTypes[type]?.menuIcon ?? entities[entityName]?.icon ?? Document;

    return <Icon {...iconProps} />;
}
