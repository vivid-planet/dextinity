import { gql, useQuery } from "@apollo/client";
import { RowActionsItem } from "@dextinity/admin";
import { ImpersonateUser, Reset } from "@dextinity/admin-icons";
import { CircularProgress } from "@mui/material";
import { FormattedMessage } from "react-intl";

import { commonImpersonationMessages } from "../common/impersonation/commonImpersonationMessages";
import { useCurrentUser } from "./hooks/currentUser";
import type { GQLUserImpersonationCheckQuery, GQLUserImpersonationCheckQueryVariables } from "./ImpersonateMenuItem.generated";
import { startImpersonation, stopImpersonation } from "./utils/handleImpersonation";

const userImpersonationCheckQuery = gql`
    query UserImpersonationCheck($id: String!) {
        user: userPermissionsUserById(id: $id) {
            id
            impersonationAllowed
        }
    }
`;

export function ImpersonateMenuItem({ userId }: { userId: string }) {
    const currentUser = useCurrentUser();

    if (currentUser.impersonated) {
        return (
            <RowActionsItem icon={<Reset />} onClick={() => stopImpersonation()}>
                {commonImpersonationMessages.stopImpersonation}
            </RowActionsItem>
        );
    }

    return <StartImpersonationMenuItem userId={userId} />;
}

function StartImpersonationMenuItem({ userId }: { userId: string }) {
    const currentUser = useCurrentUser();
    const isSelf = currentUser.id === userId;

    const { data, loading } = useQuery<GQLUserImpersonationCheckQuery, GQLUserImpersonationCheckQueryVariables>(userImpersonationCheckQuery, {
        variables: { id: userId },
        skip: isSelf,
    });
    const impersonationAllowed = data?.user.impersonationAllowed ?? false;

    const label = loading ? (
        <FormattedMessage id="dextinity.userPermissions.evaluatingPermissions" defaultMessage="Evaluating permissions" />
    ) : isSelf ? (
        <FormattedMessage id="dextinity.userPermissions.cannotImpersonateYourself" defaultMessage="Cannot impersonate yourself" />
    ) : !impersonationAllowed ? (
        <FormattedMessage id="dextinity.userPermissions.cannotImpersonate" defaultMessage="Cannot impersonate" />
    ) : (
        commonImpersonationMessages.startImpersonation
    );

    return (
        <RowActionsItem
            icon={loading ? <CircularProgress size={16} /> : <ImpersonateUser />}
            disabled={loading || !impersonationAllowed || isSelf}
            onClick={() => startImpersonation(userId)}
        >
            {label}
        </RowActionsItem>
    );
}
