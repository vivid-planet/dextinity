import { gql, useQuery } from "@apollo/client";
import { KeyValueList, Panel, Skeleton } from "@dextinity/ui";
import { useIntl } from "react-intl";

import type { GQLUserBasicDataQuery, GQLUserBasicDataQueryVariables } from "./UserBasicData.generated";

/** The name and e-mail of the user, which come from the identity provider and can't be changed here. */
export const UserPermissionsUserPageBasicDataPanel = ({ userId }: { userId: string }) => {
    const intl = useIntl();
    const { data, error } = useQuery<GQLUserBasicDataQuery, GQLUserBasicDataQueryVariables>(
        gql`
            query UserBasicData($id: String!) {
                user: userPermissionsUserById(id: $id) {
                    id
                    name
                    email
                }
            }
        `,
        {
            variables: { id: userId },
        },
    );

    if (error) {
        throw new Error(error.message);
    }

    return (
        <Panel
            title={intl.formatMessage({ id: "dextinity.userPermissions.basicData", defaultMessage: "Basic Data" })}
            description={intl.formatMessage({
                id: "dextinity.userPermissions.basicData.description",
                defaultMessage: "Managed by the identity provider.",
            })}
        >
            {data ? (
                <KeyValueList
                    items={[
                        { key: intl.formatMessage({ id: "dextinity.userPermissions.name", defaultMessage: "Name" }), value: data.user.name },
                        { key: intl.formatMessage({ id: "dextinity.userPermissions.email", defaultMessage: "E-Mail" }), value: data.user.email },
                        { key: intl.formatMessage({ id: "dextinity.userPermissions.id", defaultMessage: "ID" }), value: data.user.id },
                    ]}
                />
            ) : (
                <Skeleton variant="row" count={3} />
            )}
        </Panel>
    );
};
