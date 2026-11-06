import { Chip, Icon } from "@dextinity/ui";
import type { GQLUserGroup } from "@src/graphql.generated";
import type { JSX } from "react";
import { useIntl } from "react-intl";

import { userGroupOptions } from "./userGroupOptions";

interface Props {
    item: {
        userGroup: GQLUserGroup;
    };
}

function UserGroupChip({ item }: Props): JSX.Element | null {
    const intl = useIntl();

    if (item.userGroup === "all") {
        return null;
    }

    const option = userGroupOptions.find((option) => option.value === item.userGroup);

    if (!option?.shortLabel) {
        return null;
    }

    return (
        <Chip variant="outlined" color="secondary" size="small" startIcon={<Icon name="visibility-rules" />} title={intl.formatMessage(option.label)}>
            {intl.formatMessage(option.shortLabel)}
        </Chip>
    );
}

export { UserGroupChip };
