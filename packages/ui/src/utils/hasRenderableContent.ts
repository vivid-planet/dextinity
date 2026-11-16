import { Children, type ReactNode } from "react";

export function hasRenderableContent(node: ReactNode) {
    return Children.toArray(node).some((child) => child !== "");
}
