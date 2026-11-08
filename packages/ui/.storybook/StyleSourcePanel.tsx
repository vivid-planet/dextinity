import React from "react";
import { SyntaxHighlighter } from "storybook/internal/components";
import { useParameter } from "storybook/manager-api";

/**
 * Shows the story's `styleSource` parameter in the addon panel, next to Storybook's Code panel.
 */
export function StyleSourcePanel() {
    const styleSource: unknown = useParameter("styleSource");

    if (typeof styleSource !== "string") {
        return null;
    }
    return (
        <SyntaxHighlighter language="css" copyable padded>
            {styleSource}
        </SyntaxHighlighter>
    );
}
