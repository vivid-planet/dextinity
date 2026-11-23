---
"@dextinity/cms-admin": minor
---

Add the chat of the AI Mode, which puts the chat of the Dextinity AI Hub next to the admin

`AiModeProvider` turns the AI Mode on and collects the AI Mode toolsets of the pages. `AiModeHeaderItem` is the switch that opens the chat, and `AiModeSidePanel` is the chat itself, the side panel of the `MasterLayout`. The chat gets the tools of the toolsets of the open page, the text the user has selected, and the project's MCP server.

The AI Mode is off unless the script of the AI Hub's web component and a widget ID are set and the user has the `requiredPermission`. While it's off, `AiModeHeaderItem` and `AiModeSidePanel` render nothing. The chat sends its requests to `aiHubProxyUrl`, a route of the project's API that forwards them to the AI Hub API with the widget's secret key, so that the key doesn't reach the browser.

**Example**

```tsx
<AiModeProvider
    webComponentScriptSrc={config.aiHubWebComponentScriptSrc}
    widgetId={config.aiHubWidgetId}
    aiHubProxyUrl={`${config.apiUrl}/ai-hub`}
    mcpServerUrl={`${config.apiUrl}/mcp`}
    requiredPermission="aiHub"
>
    <MasterLayout headerComponent={MasterHeader} menuComponent={MasterMenu} sidePanelComponent={AiModeSidePanel}>
        <MasterMenuRoutes />
    </MasterLayout>
</AiModeProvider>;

// In the header
<AiModeHeaderItem />;
```

`AiModeHeaderItem` takes a `label` and an `icon` to replace the default ones.
