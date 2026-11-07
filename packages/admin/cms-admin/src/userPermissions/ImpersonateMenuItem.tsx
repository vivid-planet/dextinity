import { gql, useQuery } from "@apollo/client";
import { Icon, MenuItem } from "@dextinity/ui";
import { useIntl } from "react-intl";

import { useCurrentUser } from "./hooks/currentUser";
import type { GQLUserImpersonationCheckQuery, GQLUserImpersonationCheckQueryVariables } from "./ImpersonateMenuItem.generated";
import { useImpersonationMessages } from "./user/useImpersonationMessages";
import { startImpersonation, stopImpersonation } from "./utils/handleImpersonation";

const userImpersonationCheckQuery = gql`
    query UserImpersonationCheck($id: String!) {
        user: userPermissionsUserById(id: $id) {
            id
            impersonationAllowed
        }
    }
`;

/** A `MenuItem` of `@dextinity/ui` that starts the impersonation of the user, or stops the running impersonation. */
export function ImpersonateMenuItem({ userId }: { userId: string }) {
    const currentUser = useCurrentUser();
    const messages = useImpersonationMessages();

    if (currentUser.impersonated) {
        return <MenuItem label={messages.stopImpersonation} icon={<Icon name="reset" />} onClick={() => void stopImpersonation()} />;
    }

    return <StartImpersonationMenuItem userId={userId} />;
}

function StartImpersonationMenuItem({ userId }: { userId: string }) {
    const intl = useIntl();
    const currentUser = useCurrentUser();
    const messages = useImpersonationMessages();
    const isSelf = currentUser.id === userId;

    const { data, loading } = useQuery<GQLUserImpersonationCheckQuery, GQLUserImpersonationCheckQueryVariables>(userImpersonationCheckQuery, {
        variables: { id: userId },
        skip: isSelf,
    });
    const impersonationAllowed = data?.user.impersonationAllowed ?? false;

    const disabledReason = loading
        ? messages.evaluatingPermissions
        : isSelf
          ? messages.cannotImpersonateYourself
          : !impersonationAllowed
            ? intl.formatMessage({
                  id: "dextinity.userPermissions.cannotImpersonateReason",
                  defaultMessage: "This user has permissions or content scopes that you don't have",
              })
            : undefined;

    return (
        <MenuItem
            label={messages.startImpersonation}
            icon={<Icon name="impersonate-user" />}
            disabled={disabledReason !== undefined}
            disabledReason={disabledReason}
            onClick={() => void startImpersonation(userId)}
        />
    );
}
