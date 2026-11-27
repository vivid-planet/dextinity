import type { ApolloClient } from "@apollo/client";
import type { SvgIconProps } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Describes how the admin shows and opens entities of one type.
 *
 * All features that show or link to an entity look it up in the `entities` config: dependencies, warnings, links to the DAM and the full text search.
 * Register an entity type once there instead of in a map for each feature.
 */
export interface EntityInterface {
    /**
     * Name of the entity type shown to the user, e.g. "News" or "Page".
     */
    displayName: ReactNode;
    /**
     * Icon for the entity type, for lists that mix entities of different types.
     */
    icon?: (props: SvgIconProps<"svg">) => ReactNode;
    /**
     * Returns the admin URL path that opens the entity with the given `id`.
     */
    resolvePath: (options: {
        apolloClient: ApolloClient;
        id: string;
        /**
         * Root block column of the entity. Only passed when a block inside the entity should be opened, e.g. from the dependencies or warnings.
         */
        rootColumnName?: string;
        /**
         * Path of the block inside the root block column. Only passed together with `rootColumnName`.
         */
        jsonPath?: string;
    }) => Promise<string>;
}
