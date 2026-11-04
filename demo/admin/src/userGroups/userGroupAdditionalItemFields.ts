import type { GQLUserGroup } from "@src/graphql.generated";

const userGroupAdditionalItemFields = {
    userGroup: {
        defaultValue: "all" as GQLUserGroup,
    },
};

export { userGroupAdditionalItemFields };
