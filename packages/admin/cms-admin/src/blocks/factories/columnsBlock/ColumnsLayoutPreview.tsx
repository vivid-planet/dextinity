import { styled } from "@mui/material/styles";
import { Children, type ReactElement, type ReactNode } from "react";

interface ItemProps {
    width: number;
    label?: ReactNode;
}

interface ContainerProps {
    children: ReactElement<ItemProps>[];
}

export function ColumnsLayoutPreview({ children }: ContainerProps) {
    const columns = Children.map(children, (child) => `${child.props.width}fr`).join(" ");
    return <Root style={{ gridTemplateColumns: columns }}>{children}</Root>;
}

const Root = styled("span")`
    display: grid;
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 72px;
    block-size: 32px;
    overflow: hidden;
    border: var(--dextinity-line-width) solid var(--dextinity-color-line);
    border-radius: var(--dextinity-radius-item);
    background: var(--dextinity-color-surface-sunken);
`;

export function ColumnsLayoutPreviewSpacing(_props: ItemProps) {
    return <span />;
}

const Content = styled("span")`
    display: flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 0;
    background: var(--dextinity-color-accent-soft);
    color: var(--dextinity-color-accent-text);
    font-size: var(--dextinity-typography-small-size);
    font-variant-numeric: tabular-nums;

    & svg {
        inline-size: 14px;
        block-size: 14px;
    }
`;

export function ColumnsLayoutPreviewContent({ width, label }: ItemProps) {
    return <Content>{label ? label : width > 3 ? width : null}</Content>;
}
