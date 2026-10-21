import { GLOBALS_UPDATED, SET_GLOBALS, UPDATE_GLOBALS } from "storybook/internal/core-events";
import type { Globals } from "storybook/internal/types";
import { addons } from "storybook/manager-api";

import theme from "./theme";

addons.setConfig({
    theme,
});

/**
 * Storybook sends the toolbar globals (theme, locale, layout) to its own preview only, so stories of the composed
 * Storybooks would always render with the globals' default values: https://github.com/storybookjs/storybook/issues/15805.
 * Forward the globals to the composed Storybooks. Addressing one of them through `options.target` isn't part of Storybook's
 * documented addon API, so an update can break this.
 */
addons.register("dextinity/composed-storybook-globals", (api) => {
    const composedStorybooksWithLoadedPreview = new Set<string>();

    const sendGlobalsToComposedStorybook = (refId: string, globals: Globals) => {
        api.emit(UPDATE_GLOBALS, { globals, options: { target: refId } });
    };

    api.on(SET_GLOBALS, function (this: { refId?: string }) {
        // A composed Storybook announces its globals as soon as its preview has loaded.
        if (!this.refId) {
            return;
        }

        composedStorybooksWithLoadedPreview.add(this.refId);
        sendGlobalsToComposedStorybook(this.refId, getCurrentGlobals(api.getUserGlobals()));
    });

    api.on(GLOBALS_UPDATED, function (this: { refId?: string }, { userGlobals }: { userGlobals: Globals }) {
        // Composed Storybooks confirm the globals we sent them, forwarding those again would cause an endless loop.
        if (this.refId) {
            return;
        }

        composedStorybooksWithLoadedPreview.forEach((refId) => {
            sendGlobalsToComposedStorybook(refId, userGlobals);
        });
    });
});

/**
 * When a composed Storybook's story is opened directly, its preview is the only one that loads and the manager never
 * learns about the globals in the URL. Fall back to reading them from there, so that shared links keep working.
 */
function getCurrentGlobals(userGlobals: Globals): Globals {
    if (Object.keys(userGlobals).length > 0) {
        return userGlobals;
    }

    const globalsParam = new URLSearchParams(window.location.search).get("globals");

    // Globals are encoded as `locale:de;theme:mui`. Only plain string values, as used by the toolbar globals, are supported.
    return Object.fromEntries((globalsParam?.split(";") ?? []).map((global) => global.split(":")).filter((parts) => parts.length === 2));
}
