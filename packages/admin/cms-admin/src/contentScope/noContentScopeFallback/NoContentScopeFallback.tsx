import { gql, useMutation } from "@apollo/client";
import { Button, EmptyState, Icon, Theme, type ThemeColorScheme, Typography } from "@dextinity/ui";
import { useIntl } from "react-intl";

import { useCurrentUser } from "../../userPermissions/hooks/currentUser";
import { StopImpersonationButton } from "../../userPermissions/user/ImpersonationButtons";
import type { GQLNoContentScopeFallbackSignOutMutation, GQLNoContentScopeFallbackSignOutMutationVariables } from "./NoContentScopeFallback.generated";
import { NoContentScopeFallbackContent, NoContentScopeFallbackHelp, NoContentScopeFallbackRoot } from "./NoContentScopeFallback.sc";

const signOutMutation = gql`
    mutation NoContentScopeFallbackSignOut {
        currentUserSignOut
    }
`;

export interface NoContentScopeFallbackProps {
    /**
     * The color scheme of the page, which is shown outside the app's frame.
     *
     * @defaultValue The operating system's preference, `"dark"` or `"light"`
     */
    colorScheme?: ThemeColorScheme;
}

function getPreferredColorScheme(): ThemeColorScheme {
    return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * The page shown instead of the admin when the signed-in user has no content scope: why, what to do, and the way back to the login.
 */
export function NoContentScopeFallback({ colorScheme = getPreferredColorScheme() }: NoContentScopeFallbackProps) {
    const intl = useIntl();
    const user = useCurrentUser();
    const [signOut, { loading: signingOut }] = useMutation<
        GQLNoContentScopeFallbackSignOutMutation,
        GQLNoContentScopeFallbackSignOutMutationVariables
    >(signOutMutation);

    const reasons = [
        intl.formatMessage({
            id: "dextinity.admin.contentScope.noContentScopeError.help.reason1",
            defaultMessage: "Your access has not yet been activated by an administrator.",
        }),
        intl.formatMessage({
            id: "dextinity.admin.contentScope.noContentScopeError.help.reason2",
            defaultMessage: "You are not authorized for this environment or this company.",
        }),
        intl.formatMessage({
            id: "dextinity.admin.contentScope.noContentScopeError.help.reason3",
            defaultMessage: "There is a technical problem with your access rights.",
        }),
    ];

    return (
        <Theme colorScheme={colorScheme}>
            <NoContentScopeFallbackRoot>
                <NoContentScopeFallbackContent>
                    <EmptyState
                        icon={<Icon name="lock" />}
                        title={intl.formatMessage({
                            id: "dextinity.admin.contentScope.noContentScopeError.title",
                            defaultMessage: "No access - authorizations missing",
                        })}
                        description={intl.formatMessage({
                            id: "dextinity.admin.contentScope.noContentScopeError.description",
                            defaultMessage: "Your account is active, but you do not have access rights.",
                        })}
                        actions={
                            user.impersonated ? (
                                <StopImpersonationButton />
                            ) : (
                                <Button
                                    startIcon={<Icon name="logout" />}
                                    loading={signingOut}
                                    onClick={async () => {
                                        const result = await signOut();
                                        if (result.data) {
                                            location.href = result.data.currentUserSignOut;
                                        }
                                    }}
                                >
                                    {intl.formatMessage({
                                        id: "dextinity.admin.contentScope.noContentScopeError.signOut",
                                        defaultMessage: "Back to the login page",
                                    })}
                                </Button>
                            )
                        }
                    />
                    <NoContentScopeFallbackHelp>
                        <Typography variant="body" element="p">
                            {intl.formatMessage({
                                id: "dextinity.admin.contentScope.noContentScopeError.help.title",
                                defaultMessage:
                                    "You have successfully logged in, but your account is not authorized for any area (scope). Possible reasons:",
                            })}
                        </Typography>
                        <ul>
                            {reasons.map((reason) => (
                                <li key={reason}>
                                    <Typography variant="body" element="span">
                                        {reason}
                                    </Typography>
                                </li>
                            ))}
                        </ul>
                        <Typography variant="label" element="h2">
                            {intl.formatMessage({
                                id: "dextinity.admin.contentScope.noContentScopeError.help.whatCanYouDo",
                                defaultMessage: "What can you do?",
                            })}
                        </Typography>
                        <Typography variant="body">
                            {intl.formatMessage({
                                id: "dextinity.admin.contentScope.noContentScopeError.help.contactAdmin",
                                defaultMessage:
                                    "Please contact your administrator to check the activation. If you think this is an error, try again later.",
                            })}
                        </Typography>
                    </NoContentScopeFallbackHelp>
                </NoContentScopeFallbackContent>
            </NoContentScopeFallbackRoot>
        </Theme>
    );
}
