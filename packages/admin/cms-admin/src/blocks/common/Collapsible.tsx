import { Button } from "@dextinity/admin";
import { Collapse } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

interface CollapsibleProps {
    open: boolean;
    header: ReactNode;
    onChange: (open: boolean) => void;
}

export const Collapsible = ({ header, children, open, onChange }: PropsWithChildren<CollapsibleProps>) => {
    return (
        <>
            <Button
                fullWidth={true}
                onClick={() => {
                    onChange(!open);
                }}
                variant="textDark"
            >
                {header}
            </Button>
            <Collapse in={open} timeout="auto" unmountOnExit>
                {children}
            </Collapse>
        </>
    );
};
