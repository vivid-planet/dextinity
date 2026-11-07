import { gql, useQuery } from "@apollo/client";
import { PageHeader, type PageHeaderBack, Skeleton } from "@dextinity/ui";
import { useIntl } from "react-intl";

import { useRouterLinkClick } from "../../common/useRouterLinkClick";
import { useCurrentUser } from "../hooks/currentUser";
import { StartImpersonationButton } from "./ImpersonationButtons";
import type { GQLUserPageQuery, GQLUserPageQueryVariables } from "./UserPageToolbar.generated";

interface UserPermissionsUserPageToolbarProps {
    userId: string;
    /** The link back to the list of users. */
    back?: PageHeaderBack;
}

/**
 * The `PageHeader` of a user's page: the name and e-mail, and the start of the impersonation as the action, or its stop while any user
 * is impersonated.
 */
export const UserPermissionsUserPageToolbar = ({ userId, back }: UserPermissionsUserPageToolbarProps) => {
    const intl = useIntl();
    const currentUser = useCurrentUser();
    const navigateWithRouter = useRouterLinkClick();
    const { data, error } = useQuery<GQLUserPageQuery, GQLUserPageQueryVariables>(
        gql`
            query UserPage($id: String!) {
                user: userPermissionsUserById(id: $id) {
                    name
                    email
                    impersonationAllowed
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

    const eyebrow = intl.formatMessage({ id: "dextinity.userPermissions.eyebrow", defaultMessage: "User · Global" });

    if (!data) {
        return (
            <PageHeader
                back={back}
                slotProps={{ back: { onClick: navigateWithRouter } }}
                eyebrow={eyebrow}
                title={intl.formatMessage({ id: "dextinity.userPermissions.edit", defaultMessage: "User" })}
                subtitle={<Skeleton variant="text" width="12rem" />}
                actions={currentUser.impersonated ? <StartImpersonationButton userId={userId} /> : undefined}
            />
        );
    }

    return (
        <PageHeader
            back={back}
            slotProps={{ back: { onClick: navigateWithRouter } }}
            eyebrow={eyebrow}
            title={data.user.name}
            subtitle={data.user.email}
            actions={<StartImpersonationButton userId={userId} impersonationAllowed={data.user.impersonationAllowed} />}
        />
    );
};
