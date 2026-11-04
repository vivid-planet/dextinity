import { Card, CardContent, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { PrettyBytes } from "../PrettyBytes";

const Content = styled("div")`
    display: grid;
    grid-template-columns: auto auto;
    gap: 10px;
`;

function Normal() {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h3" gutterBottom>
                    Normal Behavior
                </Typography>
                <Content>
                    <span>0 Bytes</span>
                    <span>
                        <PrettyBytes value={0} />
                    </span>
                    <span>6 Bytes</span>
                    <span>
                        <PrettyBytes value={6} />
                    </span>
                    <span>6.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000} />
                    </span>
                    <span>6.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000} />
                    </span>
                    <span>6.000.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000000} />
                    </span>
                    <span>6.000.000.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000000000} />
                    </span>
                    <span>6.000.000.000.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000000000000} />
                    </span>
                </Content>
            </CardContent>
        </Card>
    );
}

function FixedUnit() {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h3" gutterBottom>
                    Fixed Unit (kilobyte)
                </Typography>
                <Content>
                    <span>0 Bytes</span>
                    <span>
                        <PrettyBytes value={0} unit="kilobyte" />
                    </span>
                    <span>6 Bytes</span>
                    <span>
                        <PrettyBytes value={6} unit="kilobyte" />
                    </span>
                    <span>6.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000} unit="kilobyte" />
                    </span>
                    <span>6.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000} unit="kilobyte" />
                    </span>
                    <span>6.000.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000000} unit="kilobyte" />
                    </span>
                    <span>6.000.000.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000000000} unit="kilobyte" />
                    </span>
                    <span>6.000.000.000.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000000000000} unit="kilobyte" />
                    </span>
                </Content>
            </CardContent>
        </Card>
    );
}

function CustomMaximumFractionDigits() {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h3" gutterBottom>
                    Custom maximumFractionDigits (6 digits)
                </Typography>
                <Content>
                    <span>0 Bytes</span>
                    <span>
                        <PrettyBytes value={0} unit="megabyte" maximumFractionDigits={6} />
                    </span>
                    <span>6 Bytes</span>
                    <span>
                        <PrettyBytes value={6} unit="megabyte" maximumFractionDigits={6} />
                    </span>
                    <span>6.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000} unit="megabyte" maximumFractionDigits={6} />
                    </span>
                    <span>6.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000} unit="megabyte" maximumFractionDigits={6} />
                    </span>
                    <span>6.000.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000000} unit="megabyte" maximumFractionDigits={6} />
                    </span>
                    <span>6.000.000.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000000000} unit="megabyte" maximumFractionDigits={6} />
                    </span>
                    <span>6.000.000.000.000.000 Bytes</span>
                    <span>
                        <PrettyBytes value={6000000000000000} unit="megabyte" maximumFractionDigits={6} />
                    </span>
                </Content>
            </CardContent>
        </Card>
    );
}

export default {
    title: "components/helpers/PrettyBytes",
};

export const _PrettyBytes = {
    render: () => {
        return (
            <Grid container spacing={4}>
                <Grid size={12}>
                    <Normal />
                </Grid>
                <Grid size={12}>
                    <FixedUnit />
                </Grid>
                <Grid size={12}>
                    <CustomMaximumFractionDigits />
                </Grid>
            </Grid>
        );
    },

    name: "PrettyBytes",
};
