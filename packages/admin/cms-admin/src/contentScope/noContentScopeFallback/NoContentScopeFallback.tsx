import { FullPageAlert } from "@dextinity/admin";
import { Typography } from "@mui/material";
import type { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";

import { SignOutButton } from "../../common/signOutButton/SignOutButton";
import { useCurrentUser } from "../../userPermissions/hooks/currentUser";
import { StopImpersonationButton } from "../../userPermissions/user/ImpersonationButtons";

export const NoContentScopeFallback: FunctionComponent = () => {
    const user = useCurrentUser();

    return (
        <FullPageAlert
            title={
                <FormattedMessage id="dextinity.admin.contentScope.noContentScopeError.title" defaultMessage="No access - authorizations missing" />
            }
            description={
                <Typography variant="body1" component="span">
                    <FormattedMessage
                        id="dextinity.admin.contentScope.noContentScopeError.description"
                        defaultMessage="Your account is active, but you do not have access rights."
                    />
                </Typography>
            }
            detailDescription={
                <>
                    <Typography variant="subtitle1">
                        <FormattedMessage
                            id="dextinity.admin.contentScope.noContentScopeError.help.title"
                            defaultMessage="You have successfully logged in, but your account is not authorized for any area (scope). Possible reasons:"
                        />
                    </Typography>
                    <Typography variant="list">
                        <Typography variant="listItem">
                            <FormattedMessage
                                id="dextinity.admin.contentScope.noContentScopeError.help.reason1"
                                defaultMessage="Your access has not yet been activated by an administrator."
                            />
                        </Typography>

                        <Typography variant="listItem">
                            <FormattedMessage
                                id="dextinity.admin.contentScope.noContentScopeError.help.reason2"
                                defaultMessage="You are not authorized for this environment or this company."
                            />
                        </Typography>

                        <Typography variant="listItem">
                            <FormattedMessage
                                id="dextinity.admin.contentScope.noContentScopeError.help.reason3"
                                defaultMessage="There is a technical problem with your access rights."
                            />
                        </Typography>
                    </Typography>

                    <Typography variant="subtitle1" marginBottom={2} marginTop={4}>
                        <FormattedMessage id="dextinity.admin.contentScope.noContentScopeError.help.whatCanYouDo" defaultMessage="What can you do?" />
                    </Typography>
                    <Typography variant="body1">
                        <FormattedMessage
                            id="dextinity.admin.contentScope.noContentScopeError.help.contactAdmin"
                            defaultMessage="Please contact your administrator to check the activation. If you think this is an error, try again later."
                        />
                    </Typography>
                </>
            }
            actions={
                <>
                    {user.impersonated ? (
                        <StopImpersonationButton />
                    ) : (
                        <SignOutButton variant="contained" fullWidth>
                            <FormattedMessage id="dextinity.admin.contentScope.noContentScopeError.signOut" defaultMessage="Back to the login page" />
                        </SignOutButton>
                    )}
                </>
            }
        />
    );
};
