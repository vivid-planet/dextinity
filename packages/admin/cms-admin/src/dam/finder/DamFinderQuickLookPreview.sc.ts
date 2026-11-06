import { css, styled } from "@mui/material/styles";

export const PreviewFrame = styled("div")`
    display: grid;
    place-items: center;
    box-sizing: border-box;
    inline-size: min(
        100%,
        var(--dam-finder-preview-width, 960px),
        calc(var(--dextinity-quick-look-preview-max-height) * (var(--dam-finder-preview-aspect-ratio, 4 / 3)))
    );
    aspect-ratio: var(--dam-finder-preview-aspect-ratio, 4 / 3);
    overflow: hidden;
    border-radius: var(--dextinity-quick-look-preview-radius);
    background: var(--dextinity-quick-look-preview-background);

    > * {
        grid-area: 1 / 1;
    }
`;

const previewMediaStyles = css`
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
`;

export const PreviewImage = styled("img")`
    ${previewMediaStyles}
`;

export const PreviewVideo = styled("video")`
    ${previewMediaStyles}
`;

export const PlaceholderFrame = styled("div")`
    inline-size: min(100%, 360px);
`;
