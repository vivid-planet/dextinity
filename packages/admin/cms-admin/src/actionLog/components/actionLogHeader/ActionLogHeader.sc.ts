import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export const TitleContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    marginBottom: theme.spacing(2),
}));

export const InfoContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(4),
}));

export const InfoContent = styled(Box)(({ theme }) => ({
    gap: theme.spacing(2),
    display: "flex",
}));
