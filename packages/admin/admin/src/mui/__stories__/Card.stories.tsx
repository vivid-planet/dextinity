import { ArrowRight, Reload } from "@dextinity/admin-icons";
import { Card, CardContent, CardHeader, Grid, IconButton, Typography } from "@mui/material";

import { Button } from "../../common/buttons/Button";

export default {
    title: "components/mui/Card",
};

export const _Card = () => {
    return (
        <Grid container spacing={10}>
            <Grid size={5}>
                <Card>
                    <CardHeader title={<Typography>Card Header</Typography>} />
                    <CardContent>
                        CardContent: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                        dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
                        gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
                        justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={5}>
                <Card>
                    <CardHeader title={<Typography>Card Header with Avatar (Icon)</Typography>} avatar={<Reload />} />
                    <CardContent>
                        CardContent: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                        dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
                        gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
                        justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={5}>
                <Card>
                    <CardHeader
                        title={<Typography>Card Header with Action (Button)</Typography>}
                        action={
                            <Button variant="textLight" endIcon={<ArrowRight />}>
                                Show All
                            </Button>
                        }
                    />
                    <CardContent>
                        CardContent: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                        dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
                        gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
                        justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={5}>
                <Card>
                    <CardHeader
                        title={<Typography>Card Header with Avatar (Icon) and Action (Button)</Typography>}
                        avatar={<Reload />}
                        action={
                            <Button variant="textLight" endIcon={<ArrowRight />}>
                                Show All
                            </Button>
                        }
                    />
                    <CardContent>
                        CardContent: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                        dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
                        gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
                        justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.{" "}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={5}>
                <Card>
                    <CardHeader
                        title={<Typography>Card Header with IconButton</Typography>}
                        avatar={<Reload />}
                        action={
                            <IconButton color="inherit" size="large">
                                <ArrowRight />
                            </IconButton>
                        }
                    />
                    <CardContent>
                        CardContent: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                        dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
                        gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
                        justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.{" "}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};
