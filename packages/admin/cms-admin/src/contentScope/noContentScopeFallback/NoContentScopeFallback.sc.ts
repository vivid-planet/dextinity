import { styled } from "@mui/material/styles";

export const NoContentScopeFallbackRoot = styled("main")`
    display: grid;
    place-items: center;
    min-block-size: 100dvh;
    padding: var(--dextinity-space-6) var(--dextinity-space-4);
    box-sizing: border-box;
    background: var(--dextinity-color-canvas);
`;

export const NoContentScopeFallbackContent = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-6);
    inline-size: min(100%, 560px);
`;

export const NoContentScopeFallbackHelp = styled("section")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-2);
    padding: var(--dextinity-space-6);
    border: 1px solid var(--dextinity-color-line);
    border-radius: var(--dextinity-radius-panel);
    background: var(--dextinity-color-surface);

    & ul {
        margin: 0 0 var(--dextinity-space-3);
        padding-inline-start: var(--dextinity-space-6);
    }

    & li::marker {
        color: var(--dextinity-color-text-secondary);
    }
`;
