import { createContext, useContext } from "react";

export interface CloseDialogOptions {
    /**
     * @deprecated A delay isn't wanted anymore
     */
    delay?: boolean | number;
}

export interface IEditDialogApi {
    openAddDialog: (id?: string) => void;
    openEditDialog: (id: string) => void;
    closeDialog: (options?: CloseDialogOptions) => void;
}

export const EditDialogApiContext = createContext<IEditDialogApi | null>(null);
export function useEditDialogApi() {
    return useContext(EditDialogApiContext);
}
