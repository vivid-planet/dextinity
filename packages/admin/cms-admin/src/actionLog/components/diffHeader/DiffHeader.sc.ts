import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Root = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    backgroundColor: theme.palette.grey.A200,
    padding: theme.spacing(2),
}));

export const VersionTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.common.white,
}));
