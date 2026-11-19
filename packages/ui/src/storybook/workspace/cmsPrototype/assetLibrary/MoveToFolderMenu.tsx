import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { Icon } from "../../../../components/icon/Icon";
import { MenuItem } from "../../../../components/menu/MenuItem";
import styles from "./assetLibrary.module.scss";
import { getFolderTrail, type LibraryFolder } from "./assetLibraryData";

export interface FolderChoice {
    id: string | null;
    name: string;
    /** The folders above, e.g. "Imagery / Mountains & lakes" for a folder in it. */
    path: string;
}

export function getFolderChoices(folders: LibraryFolder[]): FolderChoice[] {
    return [
        { id: null, name: "Assets", path: "" },
        ...folders
            .map((folder) => {
                const trail = getFolderTrail(folders, folder.id);
                return {
                    id: folder.id,
                    name: folder.name,
                    path: ["Assets", ...trail.slice(0, -1).map((ancestor) => ancestor.name)].join(" / "),
                };
            })
            .sort((a, b) => `${a.path} / ${a.name}`.localeCompare(`${b.path} / ${b.name}`)),
    ];
}

/**
 * The content of a "Move to" menu: a search field above the folders, so that a folder is found by typing instead of scrolling.
 * Until `@dextinity/ui` has a menu with a search, the field sits in the menu here. Arrow down moves from the field to the folders.
 */
export function MoveToFolderMenu({
    folders,
    isDisabled,
    onMove,
}: {
    folders: LibraryFolder[];
    isDisabled: (folderId: string | null) => boolean;
    onMove: (folderId: string | null, folderName: string) => void;
}) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const term = query.trim().toLowerCase();
    const choices = getFolderChoices(folders).filter((choice) => term === "" || `${choice.path} ${choice.name}`.toLowerCase().includes(term));

    useEffect(() => {
        // The menu focuses its first item when it opens; the search should have the focus instead
        const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
        return () => window.clearTimeout(timer);
    }, []);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            event.currentTarget.closest("[role='menu']")?.querySelector<HTMLElement>("[role='menuitem']:not([aria-disabled='true'])")?.focus();
        } else if (event.key !== "Escape" && event.key !== "Tab") {
            // Keeps the menu's typeahead from taking the letters typed into the search
            event.stopPropagation();
        }
    };

    return (
        <>
            <div className={styles.menuSearch}>
                <Icon name="search" size="small" />
                <input
                    ref={inputRef}
                    type="search"
                    aria-label="Search folders"
                    placeholder="Search folders"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className={styles.menuFolders}>
                {choices.length === 0 ? (
                    <p className={styles.menuEmpty}>No folder matches “{query.trim()}”</p>
                ) : (
                    choices.map((choice) => (
                        <MenuItem
                            key={choice.id ?? "root"}
                            label={choice.id == null ? choice.name : [...choice.path.split(" / ").slice(1), choice.name].join(" / ")}
                            icon={<Icon name={choice.id == null ? "images" : "folder"} />}
                            disabled={isDisabled(choice.id)}
                            onClick={() => onMove(choice.id, choice.name)}
                        />
                    ))
                )}
            </div>
        </>
    );
}
