import { Chip } from "@mui/material";
import { styled } from "@mui/material/styles";

export const EntityTypeChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
}));
