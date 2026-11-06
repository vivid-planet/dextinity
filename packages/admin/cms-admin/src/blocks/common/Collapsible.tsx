import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { styled } from "@mui/material/styles";
import { createContext, type PropsWithChildren, type ReactNode, useContext } from "react";

interface CollapsibleContextValue {
    open: boolean;
    onToggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | undefined>(undefined);

export function useCollapsible(): CollapsibleContextValue | undefined {
    return useContext(CollapsibleContext);
}

interface CollapsibleProps {
    open: boolean;
    /** The header, which toggles the content through `useCollapsible`, e.g. `CollapsibleSwitchButtonHeader`. */
    header: ReactNode;
    onChange: (open: boolean) => void;
}

export const Collapsible = ({ header, children, open, onChange }: PropsWithChildren<CollapsibleProps>) => {
    return (
        <BaseCollapsible.Root open={open} onOpenChange={onChange}>
            <CollapsibleContext.Provider value={{ open, onToggle: () => onChange(!open) }}>
                <Header>{header}</Header>
            </CollapsibleContext.Provider>
            <Panel>{children}</Panel>
        </BaseCollapsible.Root>
    );
};

const Header = styled("div")`
    display: flex;
    flex-direction: column;
    padding: var(--dextinity-space-3) var(--dextinity-space-4);
`;

// `clip` instead of `hidden`, so sticky toolbars in the content still stick to the scrolling page
const Panel = styled(BaseCollapsible.Panel)`
    block-size: var(--collapsible-panel-height);
    overflow: clip;
    transition: block-size var(--dextinity-motion-duration-medium) var(--dextinity-motion-easing);

    &[data-starting-style],
    &[data-ending-style] {
        block-size: 0;
    }
`;
