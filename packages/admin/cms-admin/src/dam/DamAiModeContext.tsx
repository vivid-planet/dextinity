import { createContext, useContext } from "react";

// Only the DAM page offers its grid and its file form to the AI Mode: the same components also render the dialog that
// chooses a file, e.g. for an image block, where the agent must not navigate.
const DamAiModeContext = createContext(false);

export const DamAiModeProvider = DamAiModeContext.Provider;

export function useIsDamAiModeEnabled() {
    return useContext(DamAiModeContext);
}
