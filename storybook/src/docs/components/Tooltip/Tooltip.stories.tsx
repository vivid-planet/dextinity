import { Tooltip } from "@dextinity/admin";
import { Grid } from "@mui/material";

export default {
    title: "Docs/Components/Tooltip",
};

export const BasicTooltip = {
    render: () => {
        return (
            <Grid container justifyContent="center" spacing={4}>
                <Grid>
                    <Tooltip title="This is a basic tooltip">
                        <div>Hover over me</div>
                    </Tooltip>
                </Grid>
            </Grid>
        );
    },

    name: "BasicTooltip",
};

export const TooltipColors = {
    render: () => {
        return (
            <Grid container justifyContent="center" spacing={4}>
                <Grid>
                    <Tooltip title="This is a light tooltip" color="light">
                        <div>Hover over me - light</div>
                    </Tooltip>
                </Grid>
                <Grid>
                    <Tooltip title="This is a dark tooltip" color="dark">
                        <div>Hover over me - dark</div>
                    </Tooltip>
                </Grid>
                <Grid>
                    <Tooltip title="This is a error tooltip" color="error">
                        <div>Hover over me - error</div>
                    </Tooltip>
                </Grid>
                <Grid>
                    <Tooltip title="This is a success tooltip" color="success">
                        <div>Hover over me - success</div>
                    </Tooltip>
                </Grid>
                <Grid>
                    <Tooltip title="This is a warning tooltip" color="warning">
                        <div>Hover over me - warning</div>
                    </Tooltip>
                </Grid>
            </Grid>
        );
    },

    name: "TooltipVariant",
};
