type AiHubConfig = {
    aiHubWebComponentScriptSrc?: string;
    aiHubWidgetId?: string;
};

/**
 * Without the script, `ScriptLoader` has nothing to load and the flyout stays empty, and without the widget ID the
 * chat can't reach the AI Hub. The AI Mode is therefore on only with both, and a missing setting turns it off rather
 * than leaving an empty flyout.
 */
export function isAiHubConfigured({ aiHubWebComponentScriptSrc, aiHubWidgetId }: AiHubConfig): boolean {
    return Boolean(aiHubWebComponentScriptSrc) && Boolean(aiHubWidgetId);
}
