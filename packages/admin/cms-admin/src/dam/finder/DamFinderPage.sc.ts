import { Dropzone } from "@dextinity/ui";
import { styled } from "@mui/material/styles";

export const FinderDropzone = styled(Dropzone)`
    min-block-size: 0;
`;

export const FinderBody = styled("div")`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--dextinity-space-4);
    block-size: 100%;

    > .dextinityAssetBrowser {
        --dextinity-asset-browser-height: 100%;
    }

    @media (min-width: 1200px) {
        grid-template-columns: minmax(0, 1fr) 320px;
    }
`;

export const DetailsColumn = styled("aside")`
    display: none;
    min-block-size: 0;
    overflow-y: auto;

    @media (min-width: 1200px) {
        display: block;
    }
`;
