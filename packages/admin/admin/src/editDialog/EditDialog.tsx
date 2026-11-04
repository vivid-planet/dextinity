import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    type DialogActionsProps,
    type DialogProps,
    DialogTitle,
    type DialogTitleProps,
} from "@mui/material";
import {
    type ComponentType,
    forwardRef,
    type ForwardRefRenderFunction,
    type PropsWithChildren,
    type ReactNode,
    useCallback,
    useImperativeHandle,
    useMemo,
} from "react";
import { useIntl } from "react-intl";

import { CancelButton } from "../common/buttons/cancel/CancelButton";
import { messages } from "../messages";
import { SaveBoundary } from "../saveBoundary/SaveBoundary";
import { SaveBoundarySaveButton } from "../saveBoundary/SaveBoundarySaveButton";
import type { ISelectionApi } from "../SelectionApi";
import { useSelectionRoute } from "../SelectionRoute";
import type { CloseDialogOptions, IEditDialogApi } from "./EditDialogApiContext";

interface ITitle {
    edit: ReactNode;
    add: ReactNode;
}

interface EditDialogComponentsProps {
    dialog?: Omit<Partial<DialogProps>, "open" | "onClose">;
    dialogActions?: Partial<DialogActionsProps>;
    dialogTitle?: Partial<DialogTitleProps>;
}

type EditDialogProps = PropsWithChildren<{
    title?: ITitle | string;
    disableCloseAfterSave?: boolean;
    onAfterSave?: () => void;
    componentsProps?: EditDialogComponentsProps;
}>;

export function useEditDialog(): [ComponentType<EditDialogProps>, { id?: string; mode?: "edit" | "add" }, IEditDialogApi, ISelectionApi] {
    const [Selection, selection, selectionApi] = useSelectionRoute();

    const openAddDialog = useCallback(
        (id?: string) => {
            selectionApi.handleAdd(id);
        },
        [selectionApi],
    );

    const openEditDialog = useCallback(
        (id: string) => {
            selectionApi.handleSelectId(id);
        },
        [selectionApi],
    );

    const closeDialog = useCallback(
        (options?: CloseDialogOptions) => {
            const { delay } = { delay: false, ...options };

            if (delay) {
                const duration = typeof delay === "number" ? delay : 1000;
                setTimeout(() => {
                    selectionApi.handleDeselect();
                }, duration);
            } else {
                selectionApi.handleDeselect();
            }
        },
        [selectionApi],
    );

    const api: IEditDialogApi = useMemo(() => {
        return {
            openAddDialog,
            openEditDialog,
            closeDialog,
        };
    }, [closeDialog, openAddDialog, openEditDialog]);

    const EditDialogWithHookProps = useMemo(() => {
        return (props: EditDialogProps) => {
            return (
                <Selection>
                    <EditDialogInner {...props} selection={selection} selectionApi={selectionApi} api={api} />
                </Selection>
            );
        };
    }, [Selection, api, selection, selectionApi]);

    return [EditDialogWithHookProps, selection, api, selectionApi];
}

interface IHookProps {
    selection: {
        id?: string;
        mode?: "edit" | "add";
    };
    selectionApi: ISelectionApi;
    api: IEditDialogApi;
}

const EditDialogInner = ({
    selection,
    selectionApi,
    api,
    title: maybeTitle,
    disableCloseAfterSave = false,
    onAfterSave,
    children,
    componentsProps,
}: PropsWithChildren<EditDialogProps & IHookProps>) => {
    const intl = useIntl();

    const title = maybeTitle ?? {
        edit: intl.formatMessage(messages.edit),
        add: intl.formatMessage(messages.add),
    };

    const handleCancelClick = () => {
        // TODO DirtyHandler removal: do we need a onReset functionality here?
        api.closeDialog();
    };

    const handleCloseClick = () => {
        api.closeDialog();
    };

    const handleAfterSave = useCallback(() => {
        setTimeout(() => {
            // TODO DirtyHandler removal: do we need a onReset functionality here?
            if (!disableCloseAfterSave) {
                api.closeDialog();
            }
        });
        onAfterSave?.();
    }, [api, disableCloseAfterSave, onAfterSave]);

    const isOpen = !!selection.mode;

    return (
        <SaveBoundary onAfterSave={handleAfterSave}>
            <Dialog open={isOpen} onClose={handleCloseClick} {...componentsProps?.dialog}>
                <DialogTitle {...componentsProps?.dialogTitle}>
                    {typeof title === "string" ? title : selection.mode === "edit" ? title.edit : title.add}
                </DialogTitle>
                {children}
                <DialogActions {...componentsProps?.dialogActions}>
                    <CancelButton onClick={handleCancelClick} />
                    <SaveBoundarySaveButton disabled={false} />
                </DialogActions>
            </Dialog>
        </SaveBoundary>
    );
};

interface IEditDialogHooklessProps extends Omit<EditDialogProps, "children"> {
    children: (injectedProps: { selectedId?: string; selectionMode?: "edit" | "add" }) => ReactNode;
}

const EditDialogHooklessInner: ForwardRefRenderFunction<IEditDialogApi, IEditDialogHooklessProps> = (
    { children, title, onAfterSave, componentsProps },
    ref,
) => {
    const [EditDialogConfigured, selection, api] = useEditDialog();
    useImperativeHandle(ref, () => api);
    return (
        <EditDialogConfigured title={title} onAfterSave={onAfterSave} componentsProps={componentsProps}>
            {children({ selectedId: selection.id, selectionMode: selection.mode })}
        </EditDialogConfigured>
    );
};
export const EditDialog = forwardRef(EditDialogHooklessInner);
