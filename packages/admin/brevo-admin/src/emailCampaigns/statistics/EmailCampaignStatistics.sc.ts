import { Banner, Link } from "@dextinity/ui";
import { styled } from "@mui/material/styles";

export const Tiles = styled("div")`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
    gap: var(--dextinity-space-4);
    padding: var(--dextinity-space-4);
`;

export const FullWidthBanner = styled(Banner)`
    grid-column: 1 / -1;
`;

export const BackLink = styled(Link)`
    && {
        gap: 4px;
        margin-inline-end: var(--dextinity-space-2);
        font-family: inherit;
        font-size: inherit;
    }
`;
