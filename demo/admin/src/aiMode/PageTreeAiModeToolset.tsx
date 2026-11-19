import type { PropsWithChildren } from "react";

import { AiModeToolset } from "./AiModeToolsets";

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
