import { Typography } from "@mui/material";

import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { Stack } from "../Stack";

export default {
    title: "components/stack/Stack",
};

export const _Stack = () => {
    return (
        <Stack topLevelTitle="Stack">
            <StackBreadcrumbs />
            <Typography>Foo</Typography>
        </Stack>
    );
};
