import type { ComponentType } from "react";

import { Preview } from "./Preview";

interface AdminMetaInterface {
    route: string;
}

export interface WithPreviewProps {
    data: WithPreviewPropsData;
}

interface WithPreviewPropsData {
    adminMeta?: AdminMetaInterface;
}

export function isWithPreviewPropsData(block: unknown): block is WithPreviewPropsData {
    return (block as WithPreviewPropsData).adminMeta !== undefined;
}

interface PreviewOptions {
    label?: string;
    enabledChildrenAutoScrolling?: boolean;
}

// No hooks or directive, so blocks using withPreview can be rendered as server components.
// adminMeta is only present in the admin's block preview, which renders on the client.
export const withPreview = <ComponentProps,>(
    Component: ComponentType<ComponentProps>,
    { label = "No type", enabledChildrenAutoScrolling = true }: PreviewOptions,
) => {
    return function WithPreview(componentProps: WithPreviewProps & ComponentProps) {
        const adminRoute = componentProps.data?.adminMeta?.route;

        if (adminRoute === undefined) {
            return <Component {...componentProps} />;
        }

        return (
            <Preview adminRoute={adminRoute} label={label} enabledChildrenAutoScrolling={enabledChildrenAutoScrolling}>
                <Component {...componentProps} />
            </Preview>
        );
    };
};
