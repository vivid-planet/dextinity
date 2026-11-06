import { useRouteMatch } from "react-router";

interface EditorTabRoute {
    /** The tab the URL points to: the first tab at the editor's URL, every other one at `<editor URL>/<key>`. */
    selectedKey: string | undefined;
    /** The URL of the editor itself, which shows the first tab. */
    editorUrl: string;
    getTabUrl: (key: string) => string;
}

/**
 * Maps the URL to the selected tab of an editor whose tabs are routes, so the tabs can be deep-linked and nested routes of a tab, e.g. a
 * block opened in the blocks tab, keep their tab selected.
 */
export function useEditorTabRoute(tabKeys: string[]): EditorTabRoute {
    const match = useRouteMatch();
    const tabMatch = useRouteMatch<{ tab: string }>(`${match.path}/:tab`);
    const [firstKey] = tabKeys;
    const routedKey = tabMatch?.params.tab;
    const selectedKey = routedKey != null && tabKeys.includes(routedKey) ? routedKey : firstKey;

    return {
        selectedKey,
        editorUrl: match.url,
        getTabUrl: (key) => (key === firstKey ? match.url : `${match.url}/${key}`),
    };
}
