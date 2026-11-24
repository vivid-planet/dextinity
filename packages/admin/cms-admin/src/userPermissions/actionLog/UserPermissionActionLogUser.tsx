import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { FormattedMessage } from "react-intl";

import type { GQLUserPermissionActionLogUserQuery, GQLUserPermissionActionLogUserQueryVariables } from "./UserPermissionActionLogUser.generated";

const userPermissionActionLogUserQuery = gql`
    query UserPermissionActionLogUser($id: String!) {
        user: userPermissionsUserById(id: $id) {
            id
            name
        }
    }
`;

type UserPermissionActionLogUserProps = {
    userId: string;
};

export function UserPermissionActionLogUser({ userId }: UserPermissionActionLogUserProps) {
    const { data } = useQuery<GQLUserPermissionActionLogUserQuery, GQLUserPermissionActionLogUserQueryVariables>(userPermissionActionLogUserQuery, {
        variables: { id: userId },
    });

    return (
        <FormattedMessage id="dextinity.userPermissions.actionLog.forUser" defaultMessage="For {user}" values={{ user: data?.user.name ?? userId }} />
    );
}
