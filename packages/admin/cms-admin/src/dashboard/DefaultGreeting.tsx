import { FormattedMessage } from "react-intl";

import { useCurrentUser } from "../userPermissions/hooks/currentUser";

export const DefaultGreeting = () => {
    const user = useCurrentUser();
    return <FormattedMessage id="dextinity.dashboard.userGreeting" defaultMessage="Hello {givenName}!" values={{ givenName: user.name }} />;
};
