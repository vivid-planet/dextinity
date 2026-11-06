import type { AssetBrowserLabels } from "@dextinity/ui";
import type { IntlShape } from "react-intl";

export function createAssetBrowserLabels(intl: IntlShape): Partial<AssetBrowserLabels> {
    return {
        folders: intl.formatMessage({ id: "dextinity.damFinder.folders", defaultMessage: "Folders" }),
        items: intl.formatMessage({ id: "dextinity.damFinder.items", defaultMessage: "Files and folders" }),
        view: intl.formatMessage({ id: "dextinity.damFinder.view", defaultMessage: "View" }),
        icons: intl.formatMessage({ id: "dextinity.damFinder.view.icons", defaultMessage: "Icons" }),
        list: intl.formatMessage({ id: "dextinity.damFinder.view.list", defaultMessage: "List" }),
        columns: intl.formatMessage({ id: "dextinity.damFinder.view.columns", defaultMessage: "Columns" }),
        gallery: intl.formatMessage({ id: "dextinity.damFinder.view.gallery", defaultMessage: "Gallery" }),
        up: intl.formatMessage({ id: "dextinity.damFinder.up", defaultMessage: "Enclosing folder" }),
        name: intl.formatMessage({ id: "dextinity.damFinder.column.name", defaultMessage: "Name" }),
        details: intl.formatMessage({ id: "dextinity.damFinder.column.details", defaultMessage: "Details" }),
        modified: intl.formatMessage({ id: "dextinity.damFinder.column.modified", defaultMessage: "Modified" }),
        empty: intl.formatMessage({ id: "dextinity.damFinder.empty", defaultMessage: "This folder is empty" }),
        itemCount: (count) =>
            intl.formatMessage({ id: "dextinity.damFinder.itemCount", defaultMessage: "{count, plural, one {# item} other {# items}}" }, { count }),
        selectedCount: (selected, total) =>
            intl.formatMessage({ id: "dextinity.damFinder.selectedCount", defaultMessage: "{selected} of {total} selected" }, { selected, total }),
        resizeSidebar: intl.formatMessage({ id: "dextinity.damFinder.resizeSidebar", defaultMessage: "Resize folders" }),
        search: intl.formatMessage({ id: "dextinity.damFinder.search", defaultMessage: "Search" }),
        searchPlaceholder: intl.formatMessage({ id: "dextinity.damFinder.searchPlaceholder", defaultMessage: "Search all folders" }),
        clearSearch: intl.formatMessage({ id: "dextinity.damFinder.clearSearch", defaultMessage: "Clear search" }),
        searchResults: intl.formatMessage({ id: "dextinity.damFinder.searchResults", defaultMessage: "Search results" }),
        location: intl.formatMessage({ id: "dextinity.damFinder.column.location", defaultMessage: "Location" }),
        searching: intl.formatMessage({ id: "dextinity.damFinder.searching", defaultMessage: "Searching…" }),
        noResults: (search) => intl.formatMessage({ id: "dextinity.damFinder.noResults", defaultMessage: "No results for “{search}”" }, { search }),
        resultCount: (count) =>
            intl.formatMessage(
                { id: "dextinity.damFinder.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                { count },
            ),
    };
}
