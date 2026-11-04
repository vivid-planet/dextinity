import { createContext, type CSSProperties, type ReactNode, useContext } from "react";

type OutlookTextStyleValues = Pick<CSSProperties, "fontFamily" | "fontSize" | "lineHeight" | "fontWeight" | "color">;

const OutlookTextStyleContext = createContext<OutlookTextStyleValues | null>(null);

function OutlookTextStyleProvider({ value, children }: { value: OutlookTextStyleValues; children: ReactNode }): ReactNode {
    return <OutlookTextStyleContext value={value}>{children}</OutlookTextStyleContext>;
}

function useOutlookTextStyle(): OutlookTextStyleValues | null {
    return useContext(OutlookTextStyleContext);
}

export { OutlookTextStyleProvider, useOutlookTextStyle };
export type { OutlookTextStyleValues };
