import { useQuery } from "@apollo/client";
import type { ContentScope } from "@dextinity/cms-admin";
import { Banner, Skeleton } from "@dextinity/ui";
import type { JSX, PropsWithChildren } from "react";
import { useIntl } from "react-intl";

import { brevoConfigCheckQuery } from "./ConfigVerification.gql";
import type { GQLBrevoConfigCheckQuery, GQLBrevoConfigCheckQueryVariables } from "./ConfigVerification.gql.generated";

interface ConfigCheckProps {
    scope: ContentScope;
}

export function ConfigVerification({ scope, children }: PropsWithChildren<ConfigCheckProps>): JSX.Element {
    const intl = useIntl();
    const { data, error, loading } = useQuery<GQLBrevoConfigCheckQuery, GQLBrevoConfigCheckQueryVariables>(brevoConfigCheckQuery, {
        variables: { scope },
        fetchPolicy: "cache-and-network",
    });

    if (error) {
        throw error;
    }

    if (loading && !data) {
        return <Skeleton variant="row" count={4} aria-busy />;
    }

    if (!data?.brevoConfig?.id) {
        return (
            <Banner tone="error">
                {intl.formatMessage({
                    id: "dextinity.missingConfig",
                    defaultMessage: "Missing brevo config! Configure brevo via the config page.",
                })}
            </Banner>
        );
    }

    return <>{children}</>;
}
