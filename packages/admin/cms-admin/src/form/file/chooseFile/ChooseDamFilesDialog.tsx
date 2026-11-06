import { DamFilePickerDialog } from "./DamFilePickerDialog";

interface ChooseDamFilesDialogProps {
    onClose: () => void;
    onConfirm: (fileIds: string[]) => void | Promise<void>;
    initialFileIds: string[];
    allowedMimetypes?: string[];
}

/**
 * A dialog to choose several files from the assets. Render it only while open.
 *
 * @deprecated Use `DamFilePickerDialog` with `multiple`, or `DamFileField` in forms built with `@dextinity/ui-react-final-form`.
 */
export const ChooseDamFilesDialog = ({ onClose, onConfirm, initialFileIds, allowedMimetypes }: ChooseDamFilesDialogProps) => (
    <DamFilePickerDialog open multiple onClose={onClose} onChoose={onConfirm} initialFileIds={initialFileIds} allowedMimetypes={allowedMimetypes} />
);
