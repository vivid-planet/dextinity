import { useState } from "react";

import { Button } from "../../../components/button/Button";
import { Dialog } from "../../../components/dialog/Dialog";
import { Field } from "../../../components/field/Field";
import { Select } from "../../../components/select/Select";
import { flattenPages, type SitePage } from "./cmsData";
import styles from "./cmsPrototype.module.scss";
import { findTrail, withDescendantIds } from "./pageTreeState";

/**
 * Moves pages without dragging: choose the new parent, the pages become its last subpages. Remounted for each opening, so it starts
 * without a choice.
 */
export function MovePageDialog({
    open,
    onOpenChange,
    pages,
    movingIds,
    onMove,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pages: SitePage[];
    movingIds: string[];
    onMove: (targetId: string) => void;
}) {
    const [targetId, setTargetId] = useState<string | null>(null);
    const allPages = flattenPages(pages);
    const moving = allPages.filter((page) => movingIds.includes(page.id));
    const excludedIds = withDescendantIds(pages, movingIds);
    const options = allPages
        .filter((page) => !excludedIds.includes(page.id))
        .map((page) => {
            const trail = findTrail(pages, page.id) ?? [];
            return { value: page.id, label: page.label, group: trail.length > 0 ? trail.map((ancestor) => ancestor.label).join(" › ") : "Root" };
        });
    const target = allPages.find((page) => page.id === targetId);
    const targetPath = target?.path == null || target.path === "/" ? "" : target.path;
    const single = moving.length === 1 ? moving[0] : undefined;
    const title = single != null ? `Move “${single.label}”` : `Move ${moving.length} pages`;

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description="The pages below come along. Every old address gets a redirect to the new one."
            footer={
                <>
                    <Button variant="outlined" color="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={targetId == null}
                        onClick={() => {
                            if (targetId != null) {
                                onMove(targetId);
                                onOpenChange(false);
                            }
                        }}
                    >
                        Move
                    </Button>
                </>
            }
        >
            <div className={styles.newPageForm}>
                <Field
                    label="New parent page"
                    description={
                        single != null && target != null && single.type !== "link"
                            ? `New path: example.com${targetPath}/${single.path?.split("/").pop() ?? ""}`
                            : "The pages become its last subpages."
                    }
                >
                    <Select name="parent" value={targetId} onChange={setTargetId} options={options} searchable placeholder="Choose a page" />
                </Field>
            </div>
        </Dialog>
    );
}
