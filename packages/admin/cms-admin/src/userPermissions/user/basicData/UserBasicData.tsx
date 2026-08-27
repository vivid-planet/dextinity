import { gql, useQuery } from "@apollo/client";
import { Field, FillSpace, FinalForm, FinalFormInput, Loading, ToolbarTitleItem } from "@dextinity/admin";
import { Card, CardContent, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import type { GQLUserBasicDataQuery, GQLUserBasicDataQueryVariables } from "./UserBasicData.generated";

export const UserPermissionsUserPageBasicDataPanel = ({ userId }: { userId: string }) => {
    const { data, error, loading } = useQuery<GQLUserBasicDataQuery, GQLUserBasicDataQueryVariables>(
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

    if (loading || !data) {
        return <Loading />;
    }

    return (
        <Card>
            <CardToolbar>
                <ToolbarTitleItem>
                    <FormattedMessage id="dextinity.userPermissions.basicData" defaultMessage="Basic Data" />
                </ToolbarTitleItem>
                <FillSpace />
            </CardToolbar>
            <CardContent>
                <FinalForm
                    mode="edit"
                    initialValues={data.user}
                    onSubmit={() => {
                        /* do nothing */
                    }}
                >
                    <Field
                        variant="horizontal"
                        name="email"
                        component={FinalFormInput}
                        disabled={true}
                        label={<FormattedMessage id="dextinity.userPermissions.email" defaultMessage="E-Mail" />}
                    />
                    <Field
                        variant="horizontal"
                        name="name"
                        component={FinalFormInput}
                        disabled={true}
                        label={<FormattedMessage id="dextinity.userPermissions.name" defaultMessage="Name" />}
                    />
                </FinalForm>
            </CardContent>
        </Card>
    );
};

const CardToolbar = styled(Toolbar)`
    top: 0px;
    border-bottom: 1px solid ${({ theme }) => theme.palette.grey[100]};
`;
