import { gql, useQuery } from "@apollo/client";
import { CrudMoreActionsMenu, FillSpace, Loading, StackToolbar, ToolbarActions, ToolbarBackButton, ToolbarTitleItem } from "@dextinity/admin";
import { ImpersonateUser, Reset } from "@dextinity/admin-icons";
import { styled } from "@mui/material/styles";

import { commonImpersonationMessages } from "../../common/impersonation/commonImpersonationMessages";
import { ContentScopeIndicator } from "../../contentScope/ContentScopeIndicator";
import { useCurrentUser, useUserPermissionCheck } from "../hooks/currentUser";
import { startImpersonation, stopImpersonation } from "../utils/handleImpersonation";
import type { GQLUserPageQuery, GQLUserPageQueryVariables } from "./UserPageToolbar.generated";

export const UserPermissionsUserPageToolbar = ({ userId }: { userId: string }) => {
    const currentUser = useCurrentUser();
    const isAllowed = useUserPermissionCheck();

    const { data, error, loading } = useQuery<GQLUserPageQuery, GQLUserPageQueryVariables>(
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

    if (loading || !data) {
        return <Loading />;
    }

    return (
        <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
            <ToolbarBackButton />
            <ToolbarTitleItem>
                <TitleText>{data.user.name}</TitleText>
                <SupportText>{data.user.email}</SupportText>
            </ToolbarTitleItem>
            <FillSpace />
            <ToolbarActions>
                {isAllowed("impersonation") && (
                    <CrudMoreActionsMenu
                        overallActions={[
                            currentUser.impersonated
                                ? {
                                      icon: <Reset />,
                                      label: commonImpersonationMessages.stopImpersonation,
                                      onClick: () => stopImpersonation(),
                                  }
                                : {
                                      label: commonImpersonationMessages.startImpersonation,
                                      icon: <ImpersonateUser />,
                                      disabled: !data.user.impersonationAllowed,
                                      onClick: () => startImpersonation(userId),
                                  },
                        ]}
                    />
                )}
            </ToolbarActions>
        </StackToolbar>
    );
};

const TitleText = styled("div")`
    font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
    font-size: 18px;
    line-height: 21px;
    color: ${({ theme }) => theme.palette.text.primary};
`;

const SupportText = styled("div")`
    font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
    font-size: 14px;
    line-height: 20px;
    color: ${({ theme }) => theme.palette.text.secondary};
`;
