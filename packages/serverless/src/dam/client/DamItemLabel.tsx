import { Stack, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

import type { DamItem } from "./damApi.types.js";
import { DamThumbnail } from "./DamThumbnail.js";

export function DamItemLabel({ item }: { item: DamItem }) {
    return (
        <Stack direction="row" spacing={2} alignItems="center" height="100%">
            <DamThumbnail item={item} />
            <Stack minWidth={0}>
                <Typography variant="body2" noWrap>
                    {item.name}
                </Typography>
                {item.archived && (
                    <Typography variant="caption" color="textSecondary">
                        <FormattedMessage id="dextinity.dam.archived" defaultMessage="Archived" />
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
}
