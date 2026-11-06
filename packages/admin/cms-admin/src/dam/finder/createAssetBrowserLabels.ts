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
    };
}
