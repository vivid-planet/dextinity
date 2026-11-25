import { styled } from "@mui/material/styles";

export const KeyboardKey = styled("kbd")`
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: ${({ theme }) => theme.spacing(0, 1)};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-bottom-width: 2px;
    border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 2}px;
    background-color: ${({ theme }) => theme.palette.background.paper};
    color: ${({ theme }) => theme.palette.text.secondary};
    font-family: inherit;
    font-size: ${({ theme }) => theme.typography.pxToRem(Number(theme.typography.caption.fontSize))};
    line-height: 1;
`;
