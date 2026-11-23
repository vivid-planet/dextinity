type AiHubConfig = {
    webComponentScriptSrc?: string;
    widgetId?: string;
};

/**
 * Without the script, `ScriptLoader` has nothing to load and the side panel stays empty, and without the widget ID the
 * chat can't reach the AI Hub. The AI Mode is therefore on only with both, and a missing setting turns it off rather
 * than leaving an empty side panel.
 */
export function isAiHubConfigured<Config extends AiHubConfig>(config: Config): config is Config & Required<AiHubConfig> {
    return Boolean(config.webComponentScriptSrc) && Boolean(config.widgetId);
}
