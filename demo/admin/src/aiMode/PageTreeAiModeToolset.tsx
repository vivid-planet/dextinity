import { AiModeToolset, useContentScope } from "@dextinity/cms-admin";
import type { PropsWithChildren } from "react";

import { createPageTreeTools } from "./hostTools";

export function PageTreeAiModeToolset({ category, children }: PropsWithChildren<{ category: string }>) {
    return (
        <AiModeToolset
            id="pageTree"
            description="The page tree of the current content scope, where the user opens pages to edit them."
            context={{ category }}
        >
            {children}
        </AiModeToolset>
    );
}
