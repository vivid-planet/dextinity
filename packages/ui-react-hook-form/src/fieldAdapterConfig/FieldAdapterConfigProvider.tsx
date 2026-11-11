import { createContext, type ReactNode, useContext, useMemo } from "react";

/**
 * When a field shows a message: once the field was touched (blurred) or the form was submitted, or right away.
 */
export type FieldMessageTiming = "touched-or-submitted" | "always";

/**
 * How the field adapters inside a `FieldAdapterConfigProvider` show validation.
 */
export interface FieldAdapterConfig {
    /**
     * When a field shows its error as `state="error"`. Use `"always"` for forms that save on every change, e.g. block forms, where no
     * submit reveals the errors.
     *
     * @defaultValue `"touched-or-submitted"`
     */
    showErrors: FieldMessageTiming;
    /**
     * When a field shows its warning as `state="warning"`. A warning never blocks submitting, and an error shown at the same time wins.
     *
     * @defaultValue `"touched-or-submitted"`
     */
    showWarnings: FieldMessageTiming;
}

const defaultConfig: FieldAdapterConfig = { showErrors: "touched-or-submitted", showWarnings: "touched-or-submitted" };

const FieldAdapterConfigContext = createContext<FieldAdapterConfig>(defaultConfig);

export interface FieldAdapterConfigProviderProps extends Partial<FieldAdapterConfig> {
    /** The forms or fields the configuration applies to. */
    children?: ReactNode;
}

/**
 * Configures how the field adapters inside it show validation. Settings left out are inherited from a surrounding provider.
 */
export function FieldAdapterConfigProvider({ showErrors, showWarnings, children }: FieldAdapterConfigProviderProps) {
    const parentConfig = useContext(FieldAdapterConfigContext);
    const config = useMemo<FieldAdapterConfig>(
        () => ({
            showErrors: showErrors ?? parentConfig.showErrors,
            showWarnings: showWarnings ?? parentConfig.showWarnings,
        }),
        [showErrors, showWarnings, parentConfig],
    );
    return <FieldAdapterConfigContext.Provider value={config}>{children}</FieldAdapterConfigContext.Provider>;
}

export function useFieldAdapterConfig() {
    return useContext(FieldAdapterConfigContext);
}
