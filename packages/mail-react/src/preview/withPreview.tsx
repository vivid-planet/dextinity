import clsx from "clsx";
import type { ComponentType, ReactNode } from "react";

import type { PropsWithData } from "../blocks/helpers/PropsWithData.js";
import { createBlockPreviewClassName, getBlockAdminRoute } from "./blockPreviewClassName.js";

type PropsWithClassName<Props> = Props & {
    /** Apply to the block's root element to make the block selectable in the block preview. */
    className?: string;
};

interface WithPreviewOptions {
    /** Block name shown in the block preview, for instance `"Button"`. */
    label?: string;
}

/** Makes a mail block selectable in the admin's block preview. Outside the block preview, the block renders unchanged. */
export function withPreview<Props extends PropsWithData>(
    Component: ComponentType<PropsWithClassName<Props>>,
    { label }: WithPreviewOptions = {},
): ComponentType<PropsWithClassName<Props>> {
    return function WithPreview(props: PropsWithClassName<Props>): ReactNode {
        const route = getBlockAdminRoute(props.data);

        if (route === undefined) {
            return <Component {...props} />;
        }

        return <Component {...props} className={clsx(props.className, createBlockPreviewClassName({ route, label }))} />;
    };
}
