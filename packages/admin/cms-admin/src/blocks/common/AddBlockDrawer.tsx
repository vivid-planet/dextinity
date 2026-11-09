import { useStackApi, useStoredState } from "@dextinity/admin";
import { BlockPicker, type BlockPickerCategory, type BlockPickerItem, Checkbox, Drawer, Icon, Typography } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { useId, useMemo, useRef, useState } from "react";
import { type IntlShape, useIntl } from "react-intl";

import { messageText } from "../form/messageText";
import { BlockCategory, blockCategoryLabels, type BlockInterface, type CustomBlockCategory } from "../types";
import { type BlockAdminComponentRootContentKind, useBlockAdminComponentRootContentKind } from "./BlockAdminComponentRoot";
import { blockIconName } from "./blockIconName";

interface Props {
    open: boolean;
    onClose: () => void;
    blocks: Record<string, BlockInterface>;
    onAddNewBlock: (type: string, addAndEdit: boolean) => void;
    /** The block the new block is inserted before. Without it, the new block is added at the end. */
    insertBefore?: BlockInterface;
}

const maxRecentBlockTypes = 4;

export function AddBlockDrawer({ open, onClose, blocks, onAddNewBlock, insertBefore }: Props) {
    const intl = useIntl();
    const stackApi = useStackApi();
    const rootContentKind = useBlockAdminComponentRootContentKind();
    const insertionHintId = useId();
    const searchRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [addAndEdit, setAddAndEdit] = useStoredState<boolean>("addAndEdit", true);
    const [recentBlockTypes, setRecentBlockTypes] = useStoredState<string[]>("addBlockDrawerRecentBlockTypes", []);

    const { items, categories } = useMemo(() => {
        const items: BlockPickerItem[] = [];
        const categories: BlockPickerCategory[] = [];
        const categoriesOrder: string[] = Object.keys(BlockCategory);

        for (const [type, block] of Object.entries(blocks)) {
            const label = messageText(intl, block.displayName);

            if (label === undefined) {
                throw new TypeError("Block displayName must be either a string or a FormattedMessage");
            }

            let id: string;
            let categoryLabel: string;

            if (isCustomBlockCategory(block.category)) {
                if (block.category.id in BlockCategory) {
                    throw new Error(
                        `Custom block category "${block.category.id}" cannot override default block category BlockCategory.${block.category.id}`,
                    );
                }

                id = block.category.id;
                categoryLabel = messageText(intl, block.category.label) ?? id;

                if (block.category.insertBefore) {
                    const insertBeforeIndex = categoriesOrder.indexOf(block.category.insertBefore);

                    if (categoriesOrder.includes(id)) {
                        const hasDifferentInsertBefore = insertBeforeIndex - 1 !== categoriesOrder.indexOf(id);

                        if (hasDifferentInsertBefore) {
                            throw new Error(`Custom block category "${id}" has different "insertBefore" values`);
                        }
                    } else {
                        categoriesOrder.splice(insertBeforeIndex, 0, id);
                    }
                } else if (!categoriesOrder.includes(id)) {
                    categoriesOrder.push(id);
                }
            } else {
                id = block.category;
                categoryLabel = messageText(intl, blockCategoryLabels[block.category]) ?? id;
            }

            if (!categories.some((category) => category.value === id)) {
                categories.push({ value: id, label: categoryLabel });
            }

            items.push({
                value: type,
                label,
                description: messageText(intl, block.description),
                icon: <Icon name={blockIconName(block)} />,
                category: id,
                keywords: block.tags?.map((tag) => (typeof tag === "string" ? tag : intl.formatMessage(tag))),
            });
        }

        categories.sort((a, b) => categoriesOrder.indexOf(a.value) - categoriesOrder.indexOf(b.value));
        items.sort((a, b) => categoriesOrder.indexOf(a.category ?? "") - categoriesOrder.indexOf(b.category ?? ""));

        return { items, categories };
    }, [intl, blocks]);

    const breadCrumbs = stackApi?.breadCrumbs ?? [];
    const containerTitle = breadCrumbs[breadCrumbs.length - 1]?.title;
    const insertionHint = getInsertionHint(intl, {
        beforeBlockName: insertBefore ? messageText(intl, insertBefore.displayName) : undefined,
        containerName: containerTitle != null ? messageText(intl, containerTitle) : undefined,
        rootContentKind: breadCrumbs.length <= 1 ? rootContentKind : undefined,
    });

    const close = () => {
        setQuery("");
        onClose();
    };

    const handleSelect = (type: string) => {
        setRecentBlockTypes([type, ...recentBlockTypes.filter((recentType) => recentType !== type)].slice(0, maxRecentBlockTypes));
        onAddNewBlock(type, addAndEdit);
        close();
    };

    return (
        <Drawer
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    close();
                }
            }}
            modal
            title={intl.formatMessage({ id: "dextinity.blocks.drawer.header", defaultMessage: "Add new block" })}
            aria-describedby={insertionHintId}
            initialFocus={searchRef}
        >
            <BlockPicker
                items={items}
                onSelect={handleSelect}
                query={query}
                onQueryChange={setQuery}
                categories={categories.length > 1 ? categories : undefined}
                recent={recentBlockTypes}
                slotProps={{ search: { ref: searchRef } }}
                labels={{
                    search: intl.formatMessage({ id: "dextinity.blocks.drawer.search", defaultMessage: "Search blocks" }),
                    recent: intl.formatMessage({ id: "dextinity.blocks.drawer.recent", defaultMessage: "Recently used" }),
                    other: intl.formatMessage({ id: "dextinity.blocks.category.other", defaultMessage: "Other" }),
                    empty: intl.formatMessage({ id: "dextinity.blocks.drawer.noResults", defaultMessage: "No block matches your search." }),
                }}
            >
                <Options>
                    <Checkbox checked={addAndEdit} onChange={setAddAndEdit}>
                        {intl.formatMessage({ id: "dextinity.blocks.drawer.editAfterAdding", defaultMessage: "Edit the block after adding it" })}
                    </Checkbox>
                    <Typography variant="small" id={insertionHintId}>
                        {insertionHint}
                    </Typography>
                </Options>
            </BlockPicker>
        </Drawer>
    );
}

function getInsertionHint(
    intl: IntlShape,
    {
        beforeBlockName,
        containerName,
        rootContentKind,
    }: { beforeBlockName?: string; containerName?: string; rootContentKind?: BlockAdminComponentRootContentKind },
) {
    if (beforeBlockName !== undefined) {
        return intl.formatMessage(
            { id: "dextinity.blocks.drawer.insertionHint.before", defaultMessage: "Will be inserted before “{blockName}”." },
            { blockName: beforeBlockName },
        );
    }

    if (rootContentKind === "page") {
        return intl.formatMessage({
            id: "dextinity.blocks.drawer.insertionHint.endOfPage",
            defaultMessage: "Will be inserted at the end of the page.",
        });
    }

    if (rootContentKind === "email") {
        return intl.formatMessage({
            id: "dextinity.blocks.drawer.insertionHint.endOfEmail",
            defaultMessage: "Will be inserted at the end of the email.",
        });
    }

    if (containerName !== undefined && containerName !== "") {
        return intl.formatMessage(
            { id: "dextinity.blocks.drawer.insertionHint.endOf", defaultMessage: "Will be inserted at the end of “{containerName}”." },
            { containerName },
        );
    }

    return intl.formatMessage({ id: "dextinity.blocks.drawer.insertionHint.end", defaultMessage: "Will be inserted at the end of the list." });
}

function isCustomBlockCategory(category: BlockCategory | CustomBlockCategory): category is CustomBlockCategory {
    return typeof category === "object";
}

const Options = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-1);
    padding-block: var(--dextinity-space-1) var(--dextinity-space-2);
`;
