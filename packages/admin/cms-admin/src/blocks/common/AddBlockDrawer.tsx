import { useStoredState } from "@dextinity/admin";
import { BlockPicker, type BlockPickerCategory, type BlockPickerItem, Checkbox, Drawer } from "@dextinity/ui";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { messageText } from "../form/messageText";
import { BlockCategory, blockCategoryLabels, type BlockInterface, type CustomBlockCategory } from "../types";

interface Props {
    open: boolean;
    onClose: () => void;
    blocks: Record<string, BlockInterface>;
    onAddNewBlock: (type: string, addAndEdit: boolean) => void;
}

const maxRecentBlockTypes = 4;

export function AddBlockDrawer({ open, onClose, blocks, onAddNewBlock }: Props) {
    const intl = useIntl();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string | null>(null);
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
                category: id,
                keywords: block.tags?.map((tag) => (typeof tag === "string" ? tag : intl.formatMessage(tag))),
            });
        }

        categories.sort((a, b) => categoriesOrder.indexOf(a.value) - categoriesOrder.indexOf(b.value));
        items.sort((a, b) => categoriesOrder.indexOf(a.category ?? "") - categoriesOrder.indexOf(b.category ?? ""));

        return { items, categories };
    }, [intl, blocks]);

    const close = () => {
        setQuery("");
        setCategory(null);
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
            footer={
                <Checkbox checked={addAndEdit} onChange={setAddAndEdit}>
                    {intl.formatMessage({ id: "dextinity.blocks.drawer.editAfterAdding", defaultMessage: "Edit the block after adding it" })}
                </Checkbox>
            }
        >
            <BlockPicker
                items={items}
                onSelect={handleSelect}
                query={query}
                onQueryChange={setQuery}
                categories={categories.length > 1 ? categories : undefined}
                category={category}
                onCategoryChange={setCategory}
                recent={recentBlockTypes}
                slotProps={{ search: { autoFocus: true } }}
                labels={{
                    search: intl.formatMessage({ id: "dextinity.blocks.drawer.search", defaultMessage: "Search blocks" }),
                    categories: intl.formatMessage({ id: "dextinity.blocks.drawer.categories", defaultMessage: "Categories" }),
                    all: intl.formatMessage({ id: "dextinity.blocks.drawer.allCategories", defaultMessage: "All" }),
                    recent: intl.formatMessage({ id: "dextinity.blocks.drawer.recent", defaultMessage: "Recently used" }),
                    other: intl.formatMessage({ id: "dextinity.blocks.category.other", defaultMessage: "Other" }),
                    empty: intl.formatMessage({ id: "dextinity.blocks.drawer.noResults", defaultMessage: "No block matches your search." }),
                }}
            />
        </Drawer>
    );
}

function isCustomBlockCategory(category: BlockCategory | CustomBlockCategory): category is CustomBlockCategory {
    return typeof category === "object";
}
