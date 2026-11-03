import { messages } from "@dextinity/admin";
import { Box, Chip } from "@mui/material";
import { useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
import { getContentScopeLabel } from "../../../contentScope/utils/getContentScopeLabel";

type ScopeCellProps = {
    scopes: ContentScope[] | null;
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
                <Chip key={JSON.stringify(scope)} label={getContentScopeLabel({ scope, values: scopeValues })} />
            ))}
        </Box>
    );
}
