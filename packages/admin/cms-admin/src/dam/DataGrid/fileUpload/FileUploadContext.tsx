import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";

import type { FileWithFolderPath } from "./useDamFileUpload";

export interface NewlyUploadedItem {
    id: string;
    parentId?: string;
    type: "file" | "folder";
    file?: FileWithFolderPath;
}

interface FileUploadContextApi {
    newlyUploadedItems: NewlyUploadedItem[];
    addNewlyUploadedItems: (newlyUploadedItems: NewlyUploadedItem[]) => void;
}

const FileUploadContext = createContext<FileUploadContextApi>({
    newlyUploadedItems: [],
    addNewlyUploadedItems: () => {
        console.warn("If you want to track newlyUploadedItems, FileUploadContextProvider has to be defined higher up in the tree");
    },
});

export const useFileUploadContext = () => useContext(FileUploadContext);

export const FileUploadContextProvider = ({ children }: { children?: ReactNode }) => {
    const timeouts = useRef<NodeJS.Timeout[]>([]);
    const [newlyUploadedItems, setNewlyUploadedItems] = useState<NewlyUploadedItem[]>([]);

    useEffect(() => {
        return () => {
            for (const timeout of timeouts.current) {
                clearTimeout(timeout);
            }
            setNewlyUploadedItems([]);
        };
    }, []);

    const addNewlyUploadedItems = (items: NewlyUploadedItem[]) => {
        setNewlyUploadedItems((newlyUploadedItems) => [...items, ...newlyUploadedItems]);

        const timeout = setTimeout(() => {
            // remove uploaded items automatically after 5 seconds
            setNewlyUploadedItems((newlyUploadedItems) => newlyUploadedItems.filter((itemId) => !items.includes(itemId)));

            timeouts.current = timeouts.current.filter((t) => t !== timeout);
        }, 10000);

        timeouts.current.push(timeout);
    };

    return (
        <FileUploadContext.Provider value={{ newlyUploadedItems, addNewlyUploadedItems: addNewlyUploadedItems }}>
            {children}
        </FileUploadContext.Provider>
    );
};
