import { Box, Chip } from "@mui/material";
import type { GQLUserGroup } from "@src/graphql.generated";
import type { JSX } from "react";

import { userGroupOptions } from "./userGroupOptions";

interface Props {
    item: {
        userGroup: GQLUserGroup;
    };
}

function UserGroupChip({ item }: Props): JSX.Element | null {
    if (item.userGroup === "all") {
        return null;
    }

    const label = userGroupOptions.find((option) => option.value === item.userGroup)?.label;

    if (!label) {
        return null;
    }

    return (
        <Box paddingTop={2}>
            <Chip label={label} />
        </Box>
    );
}

export { UserGroupChip };
