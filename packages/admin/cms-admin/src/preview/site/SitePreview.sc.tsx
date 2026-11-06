import { DevicePreview } from "@dextinity/ui";
import { styled } from "@mui/material/styles";

export const Root = styled("div")`
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    gap: var(--dextinity-space-2);
    padding: var(--dextinity-space-2) var(--dextinity-space-3) var(--dextinity-space-3);
    background: var(--dextinity-color-surface);
    color: var(--dextinity-color-text);
`;

export const Header = styled("header")`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-block-size: 40px;
`;

export const SiteInformation = styled("div")`
    display: inline-flex;
    align-items: center;
    gap: var(--dextinity-space-2);
`;

export const PreviewArea = styled(DevicePreview)`
    flex: 1;
    min-block-size: 0;
`;
