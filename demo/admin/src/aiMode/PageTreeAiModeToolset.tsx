import { useContentScope } from "@dextinity/cms-admin";
import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router";

import { AiModeToolset } from "./AiModeToolsets";
import { createPageTreeTools } from "./hostTools";

export function PageTreeAiModeToolset({ category, children }: PropsWithChildren<{ category: string }>) {
    const navigate = useNavigate();
    const { match } = useContentScope();

    return (
        <AiModeToolset
            id="pageTree"
            description="The page tree of the current content scope, where the user opens pages to edit them."
            context={{ category }}
            tools={createPageTreeTools({ navigate: (path) => void navigate(path), scopeUrl: match.url })}
        >
            {children}
        </AiModeToolset>
    );
}
