import { Button, Dialog, type TreeNode, TreeView } from "@dextinity/ui";
import { useState } from "react";

/** A page as the page picker of an application would set it as the field's value. */
export interface Page {
    id: string;
    name: string;
    path: string;
}

const pages: TreeNode[] = [
    {
        id: "home",
        label: "Home",
        path: "/",
        children: [
            { id: "products", label: "Products", path: "/products" },
            { id: "about", label: "About us", path: "/about" },
            { id: "contact", label: "Contact", path: "/contact" },
        ],
    },
];

function findPage(nodes: TreeNode[], id: string | undefined): Page | null {
    for (const node of nodes) {
        if (node.id === id) {
            return { id: node.id, name: node.label, path: node.path ?? "" };
        }
        const child = node.children && findPage(node.children, id);
        if (child) {
            return child;
        }
    }
    return null;
}

interface PagePickerDialogProps {
    open: boolean;
    value: Page | null;
    onChange: (value: Page | null) => void;
    onClose: () => void;
}

/** A stand-in for an application's page picker: a dialog with the page tree. */
export function PagePickerDialog({ open, value, onChange, onClose }: PagePickerDialogProps) {
    const [selectedId, setSelectedId] = useState(value?.id);
    const [expandedIds, setExpandedIds] = useState(["home"]);

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    onClose();
                }
            }}
            title="Choose a page"
            footer={
                <>
                    <Button variant="text" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={selectedId == null} onClick={() => onChange(findPage(pages, selectedId))}>
                        Choose
                    </Button>
                </>
            }
        >
            <TreeView
                aria-label="Pages"
                nodes={pages}
                expandedIds={expandedIds}
                onExpandedChange={setExpandedIds}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
        </Dialog>
    );
}
