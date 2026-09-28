/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useState } from "react";
import { AddonPanel, Badge } from "storybook/internal/components";
import { useChannel } from "storybook/manager-api";

const RENDER_RESULT_EVENT = "dextinity-mail-render-result";

type MjmlWarning = {
    tagName: string;
    line: number;
    message: string;
};

type RenderResult = {
    mjmlWarnings: MjmlWarning[];
};

export function MjmlWarningsPanel({ active }: { active: boolean }) {
    const [renderResult, setRenderResult] = useState<RenderResult | null>(null);

    useChannel({
        [RENDER_RESULT_EVENT]: (result: RenderResult) => {
            setRenderResult(result);
        },
    });

    return (
        <AddonPanel active={active}>
            {renderResult && (
                <div style={{ padding: 16 }}>
                    {renderResult.mjmlWarnings.length === 0 ? (
                        <p style={{ color: "green" }}>✓ No MJML warnings</p>
                    ) : (
                        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                            {renderResult.mjmlWarnings.map((warning, index) => (
                                <li key={index} style={{ marginBottom: 8 }}>
                                    <strong>{warning.tagName}</strong> (line {warning.line}): {warning.message}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </AddonPanel>
    );
}

export function MjmlWarningsPanelTitle() {
    const [renderResult, setRenderResult] = useState<RenderResult | null>(null);

    useChannel({
        [RENDER_RESULT_EVENT]: (result: RenderResult) => {
            setRenderResult(result);
        },
    });

    const warningCount = renderResult?.mjmlWarnings.length ?? 0;
    const hasWarnings = warningCount > 0;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>MJML Warnings</span>
            <Badge compact status={hasWarnings ? "negative" : "positive"}>
                {hasWarnings ? warningCount : "✓"}
            </Badge>
        </div>
    );
}
