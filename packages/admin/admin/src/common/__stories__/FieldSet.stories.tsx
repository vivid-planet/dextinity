import { Info } from "@dextinity/admin-icons";
import { Chip, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";

import { FieldSet } from "../FieldSet";
import { Tooltip } from "../Tooltip";

const textContent =
    "FieldSet content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export default {
    title: "components/common/FieldSet",
};

export const _FieldSet = {
    render: () => (
        <Stack spacing={4}>
            <FieldSet title="FieldSet Title" supportText="Support text">
                {textContent}
            </FieldSet>

            <FieldSet supportText="Support text">
                <Typography variant="h6">FieldSet without a header/summary</Typography>
                {textContent}
            </FieldSet>

            <FieldSet
                title={
                    <>
                        FieldSet with an icon
                        <Tooltip title="Lorem ipsum info." sx={{ ml: 1 }}>
                            <Info />
                        </Tooltip>
                    </>
                }
            >
                {textContent}
            </FieldSet>

            <FieldSet title="FieldSet closed by default" initiallyExpanded={false}>
                {textContent}
            </FieldSet>

            <FieldSet title="FieldSet with a chip" endAdornment={<Chip color="default" label="Chip text" />}>
                {textContent}
            </FieldSet>

            <FieldSet title="FieldSet with full-width content" disablePadding>
                <Box sx={({ palette }) => ({ p: 4, background: palette.primary.light })}>{textContent}</Box>
            </FieldSet>

            <FieldSet title="FieldSet not collapsible" collapsible={false}>
                {textContent}
            </FieldSet>
        </Stack>
    ),

    name: "FieldSet",
};
