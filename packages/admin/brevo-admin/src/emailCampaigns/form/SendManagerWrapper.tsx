import { useQuery } from "@apollo/client";
import { Alert, Loading } from "@dextinity/admin";
import type { ContentScope } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import type { PropsWithChildren } from "react";
import { FormattedMessage } from "react-intl";

import { brevoConfigQuery } from "./SendManagerWrapper.gql";
import type { GQLIsBrevoConfigDefinedQuery, GQLIsBrevoConfigDefinedQueryVariables } from "./SendManagerWrapper.gql.generated";

interface SendManagerWrapperProps {
    scope: ContentScope;
}

export const SendManagerWrapper = ({ scope, children }: PropsWithChildren<SendManagerWrapperProps>) => {
    const {
        data: brevoConfig,
        loading,
        error,
    } = useQuery<GQLIsBrevoConfigDefinedQuery, GQLIsBrevoConfigDefinedQueryVariables>(brevoConfigQuery, {
        variables: { scope },
        fetchPolicy: "network-only",
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        throw error;
    }

    if (brevoConfig?.isBrevoConfigDefined === false) {
        return (
            <Typography>
                <Alert severity="error">
                    <FormattedMessage
                        id="dextinity.emailCampaigns.configNotDefined"
                        defaultMessage="Brevo configuration is not defined. Please ask an administrator to set it up before sending email campaigns."
                    />
                </Alert>
            </Typography>
        );
    }

    return <> {children} </>;
};
