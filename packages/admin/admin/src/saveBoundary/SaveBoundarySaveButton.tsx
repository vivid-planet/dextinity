import { SaveButton, type SaveButtonProps } from "../common/buttons/SaveButton";
import { useSaveBoundaryApi, useSaveBoundaryState } from "./SaveBoundary";

export function SaveBoundarySaveButton(props: SaveButtonProps) {
    const saveBoundaryState = useSaveBoundaryState();
    const saveBoundaryApi = useSaveBoundaryApi();
    if (!saveBoundaryState || !saveBoundaryApi) {
        throw new Error("SaveBoundarySaveButton must be inside SaveBoundary");
    }

    return (
        <SaveButton
            disabled={!saveBoundaryState.hasChanges}
            loading={saveBoundaryState.saving}
            hasErrors={saveBoundaryState.hasErrors}
            onClick={async () => {
                await saveBoundaryApi.save();
            }}
            {...props}
        />
    );
}
