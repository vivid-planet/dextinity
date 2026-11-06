import { DamFilePickerDialog } from "./DamFilePickerDialog";

interface ChooseFileDialogProps {
    open: boolean;
    onClose: () => void;
    onChooseFile: (fileId: string) => void;
    allowedMimetypes?: string[];
}

/**
 * A dialog to choose one file from the assets.
 *
 * @deprecated Use `DamFilePickerDialog`, or `DamFileField` in forms built with `@dextinity/ui-react-final-form`.
 */
export const ChooseDamFileDialog = ({ open, onClose, onChooseFile, allowedMimetypes }: ChooseFileDialogProps) => (
    <DamFilePickerDialog open={open} onClose={onClose} onChoose={([fileId]) => onChooseFile(fileId)} allowedMimetypes={allowedMimetypes} />
);
