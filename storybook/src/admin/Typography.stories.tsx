import { Divider, Grid, Paper, Typography } from "@mui/material";

export default {
    title: "@dextinity/admin/Typography",
};

export const _Typography = () => (
    <Paper sx={{ padding: 10 }}>
        <Typography variant="body1">Headlines</Typography>
        <Divider />
        <Grid container>
            <Grid py={4} size={12}>
                <Typography variant="h1">Lorem ipsum dolor</Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="h2">Lorem ipsum dolor</Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="h3">Lorem ipsum dolor</Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="h4">Lorem ipsum dolor</Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="h5">Lorem ipsum dolor</Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="h6">Lorem ipsum dolor</Typography>
            </Grid>
        </Grid>

        <Typography variant="body1" pt={4}>
            Texts
        </Typography>
        <Divider />
        <Grid container>
            <Grid py={4} size={12}>
                <Typography variant="body1">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque
                    penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                </Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="body2">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque
                    penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                </Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="caption">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque
                    penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                </Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="subtitle1">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque
                    penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                </Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="subtitle2">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque
                    penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                </Typography>
            </Grid>
            <Grid py={4} size={12}>
                <Typography variant="overline">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque
                    penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                </Typography>
            </Grid>
        </Grid>

        <Typography variant="body1" pt={4}>
            Button
        </Typography>
        <Divider />
        <Grid container>
            <Grid py={4} size={12}>
                <Typography variant="button">Button text</Typography>
            </Grid>
        </Grid>
    </Paper>
);
