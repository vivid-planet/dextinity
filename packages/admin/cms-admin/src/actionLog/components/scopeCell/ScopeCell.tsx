import { messages } from "@comet/admin";
import { Box, Chip } from "@mui/material";
import { capitalCase } from "change-case";
import isEqual from "lodash.isequal";
import { useIntl } from "react-intl";

import { type ContentScope, type ContentScopeValues, useContentScope } from "../../../contentScope/Provider";

type ScopeCellProps = {
    scopes: ContentScope[] | null;
};

const formatScopeLabel = (scope: ContentScope, scopeValues: ContentScopeValues): string => {
    const matched = scopeValues.find((item) => isEqual(item.scope, scope));
    const source = matched ?? { scope, label: undefined as Record<string, string> | undefined };
    return Object.keys(source.scope)
        .map((key) => source.label?.[key] ?? capitalCase(String(source.scope[key])))
        .join(" / ");
};

export function ScopeCell({ scopes }: ScopeCellProps) {
    const intl = useIntl();
    const { values: scopeValues } = useContentScope();

    if (!scopes || scopes.length === 0) {
        return <Chip label={intl.formatMessage(messages.globalContentScope)} />;
    }

    return (
        <Box display="flex" gap={1} flexWrap="wrap">
            {scopes.map((scope) => (
                <Chip key={JSON.stringify(scope)} label={formatScopeLabel(scope, scopeValues)} />
            ))}
        </Box>
    );
}
