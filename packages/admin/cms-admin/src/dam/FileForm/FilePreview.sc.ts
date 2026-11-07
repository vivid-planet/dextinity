import { Panel } from "@dextinity/ui";
import { styled } from "@mui/material/styles";

export const PreviewPanel = styled(Panel)`
    display: flex;
    flex-direction: column;

    // The body below the header fills the pane and scrolls
    > :last-child {
        flex: 1;
        min-block-size: 0;
        overflow: auto;
    }
`;

export const PreviewBody = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-4);
    min-block-size: 100%;
`;

export const PreviewStage = styled("div")`
    display: grid;
    flex: 1 0 auto;
    place-items: center;
    min-block-size: 280px;
    padding: var(--dextinity-space-4);
    border-radius: var(--dextinity-radius-item);
    background: var(--dextinity-color-surface-sunken);

    &[data-type="pdf"] {
        place-items: stretch;
        padding: 0;
    }

    img {
        display: block;
        max-inline-size: 100%;
        max-block-size: max(240px, calc(100dvh - 460px));
    }
`;
