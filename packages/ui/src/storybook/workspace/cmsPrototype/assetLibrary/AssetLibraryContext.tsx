import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useContext, useState } from "react";

import { ToastViewport } from "../../../../components/toast/ToastViewport";
import { type NewToast, useToasts } from "../../../../components/toast/useToasts";
import { useUndoToast } from "../../../../components/undoToast/useUndoToast";
import { applyScenario, lengthen, type Scenario } from "../../../scenario";
import { type AssetKind, type LibraryAsset, libraryAssets, type LibraryFolder, libraryFolders } from "./assetLibraryData";

export type LibraryView = "tiles" | "list";
export type LibrarySortKey = "name" | "modified" | "size" | "kind";
export type SmartFilter = "unused" | "archived";

/** What the library shows; kept while the user visits an asset's detail page, so that "Assets" leads back to the same place. */
export interface LibraryLocation {
    folderId: string | null;
    view: LibraryView;
    tileSize: number;
    sort: { key: LibrarySortKey; direction: "ascending" | "descending" };
    page: number;
    pageSize: number;
    kind: AssetKind | null;
    flat: boolean;
    smartFilter: SmartFilter | null;
    /** The folder to return to when the smart filter is switched off again. */
    folderBeforeSmartFilter: string | null;
    search: string;
}

export const initialLocation: LibraryLocation = {
    folderId: null,
    view: "tiles",
    tileSize: 168,
    sort: { key: "name", direction: "ascending" },
    page: 1,
    pageSize: 100,
    kind: null,
    flat: false,
    smartFilter: null,
    folderBeforeSmartFilter: null,
    search: "",
};

interface AssetLibraryState {
    assets: LibraryAsset[];
    setAssets: Dispatch<SetStateAction<LibraryAsset[]>>;
    folders: LibraryFolder[];
    setFolders: Dispatch<SetStateAction<LibraryFolder[]>>;
    location: LibraryLocation;
    setLocation: Dispatch<SetStateAction<LibraryLocation>>;
    addToast: (toast: NewToast) => string;
    undoToast: ReturnType<typeof useUndoToast>;
    updateAsset: (id: string, changes: Partial<LibraryAsset>) => void;
}

const AssetLibraryContext = createContext<AssetLibraryState | null>(null);

/**
 * The assets and folders of the CMS prototype and where the library stands, shared by the library and the detail page. Holds the
 * toasts too, so that an undo toast stays when the page changes, e.g. after deleting an asset on its detail page.
 */
export function AssetLibraryProvider({
    children,
    initial,
    scenario = "default",
}: PropsWithChildren<{ initial?: Partial<LibraryLocation>; scenario?: Scenario }>) {
    const [assets, setAssets] = useState(() =>
        applyScenario(libraryAssets, scenario, {
            copy: (asset, round) => ({ ...asset, id: `${asset.id}-${round}`, name: asset.name.replace(/(\.\w+)$/, `-${round + 1}$1`) }),
            stretch: (asset) => ({ ...asset, name: lengthen(asset.name) }),
        }),
    );
    const [folders, setFolders] = useState(() => (scenario === "empty" ? [] : libraryFolders));
    const [location, setLocation] = useState<LibraryLocation>({ ...initialLocation, ...initial });
    const { toasts, add, dismiss } = useToasts();
    const undoToast = useUndoToast({ addToast: add });

    const updateAsset = (id: string, changes: Partial<LibraryAsset>) =>
        setAssets((current) => current.map((asset) => (asset.id === id ? { ...asset, ...changes } : asset)));

    return (
        <AssetLibraryContext.Provider
            value={{ assets, setAssets, folders, setFolders, location, setLocation, addToast: add, undoToast, updateAsset }}
        >
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </AssetLibraryContext.Provider>
    );
}

export function useAssetLibrary() {
    const state = useContext(AssetLibraryContext);
    if (state == null) {
        throw new Error("useAssetLibrary needs an AssetLibraryProvider");
    }
    return state;
}
