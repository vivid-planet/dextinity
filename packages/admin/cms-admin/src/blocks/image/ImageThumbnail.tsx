import { styled } from "@mui/material/styles";

const sizeFittingTableGridRow = 36;

export const ImageThumbnail = styled("img")({
    display: "block",
    width: sizeFittingTableGridRow,
    height: sizeFittingTableGridRow,
    objectFit: "contain",
    objectPosition: "left center",
});
