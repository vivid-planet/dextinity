import { useContentScope } from "@dextinity/cms-admin";
import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router";

import { AiModeScope } from "./AiModeScopes";
import { createPageTreeTools } from "./hostTools";

export function PageTreeAiModeScope({ category, children }: PropsWithChildren<{ category: string }>) {
    const navigate = useNavigate();
    const { match } = useContentScope();

    return (
        <AiModeScope
            id="pageTree"
            description="The page tree of the current content scope, where the user opens pages to edit them."
            context={{ category }}
            tools={createPageTreeTools({ navigate: (path) => void navigate(path), scopeUrl: match.url })}
        >
            {children}
        </AiModeScope>
    );
}
