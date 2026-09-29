import { useStoredState } from "@dextinity/admin";
import { Close, Search } from "@dextinity/admin-icons";
import {
    Checkbox,
    DialogContent,
    DialogTitle,
    Drawer,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputBase,
    List,
    ListItemButton,
    Paper,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { type ChangeEventHandler, isValidElement, type KeyboardEventHandler, type ReactElement, type ReactNode, useMemo, useState } from "react";
import { FormattedMessage, type MessageDescriptor, useIntl } from "react-intl";

import { BlockCategory, blockCategoryLabels, type BlockInterface, type CustomBlockCategory } from "../types";

type BlockType = string;

interface Category {
    id: string;
    label: ReactNode;
    blocks: Array<[BlockType, BlockInterface]>;
}

interface Props {
    open: boolean;
    onClose: () => void;
    blocks: Record<string, BlockInterface>;
    onAddNewBlock: (type: string, addAndEdit: boolean) => void;
}

export function AddBlockDrawer({ open, onClose, blocks, onAddNewBlock }: Props) {
    const intl = useIntl();
    const [searchValue, setSearchValue] = useState("");
    const [addAndEdit, setAddAndEdit] = useStoredState<boolean>("addAndEdit", true);

    const categories = useMemo(() => {
        const categories: Category[] = [];
        const categoriesOrder = Object.keys(BlockCategory);

        for (const [type, block] of Object.entries(blocks)) {
            let blockName: string;

            if (typeof block.displayName === "string") {
                blockName = block.displayName;
            } else if (isFormattedMessage(block.displayName)) {
                blockName = intl.formatMessage(block.displayName.props);
            } else {
                throw new TypeError("Block displayName must be either a string or a FormattedMessage");
            }

            const searchValueLower = searchValue.toLocaleLowerCase();

            let blockTags: string[] = [];
            if (block.tags) {
                blockTags = block.tags.map((tag) => {
                    if (typeof tag === "string") {
                        return tag.toLocaleLowerCase();
                    } else {
                        return intl.formatMessage(tag).toLocaleLowerCase();
                    }
                });
            }
            const tagMatches = blockTags.some((tag) => tag.includes(searchValueLower));

            if (!blockName.toLocaleLowerCase().includes(searchValueLower) && !tagMatches) {
                continue;
            }

            let id: string;
            let label: ReactNode;

            if (isCustomBlockCategory(block.category)) {
                if (block.category.id in BlockCategory) {
                    throw new Error(
                        `Custom block category "${block.category.id}" cannot override default block category BlockCategory.${block.category.id}`,
                    );
                }

                id = block.category.id;
                label = block.category.label;

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
                } else {
                    if (!categoriesOrder.includes(id)) {
                        categoriesOrder.push(id);
                    }
                }
            } else {
                id = block.category;
                label = blockCategoryLabels[block.category];
            }

            let category = categories.find((category) => category.id === id);

            if (!category) {
                category = { id, label, blocks: [] };
                categories.push(category);
            }

            category.blocks.push([type, block]);
        }

        categories.sort((a, b) => categoriesOrder.indexOf(a.id) - categoriesOrder.indexOf(b.id));

        return categories;
    }, [intl, blocks, searchValue]);

    const handleListItemClick = (type: string) => {
        onAddNewBlock(type, addAndEdit);
        onClose();
    };

    const handleSearchFieldChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        setSearchValue(event.target.value);
    };

    const handleSearchFieldKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
        const hasSearchResults = categories.length > 0 && categories[0].blocks.length > 0;

        if (event.key === "Enter" && hasSearchResults) {
            const firstBlockInList = categories[0].blocks[0];
            const [blockType] = firstBlockInList;
            handleListItemClick(blockType);
        }
    };

    const handleAddAndEditChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        setAddAndEdit(event.target.checked);
    };

    return (
        <Drawer open={open} onClose={onClose} anchor="right">
            <Header>
                <FormattedMessage id="dextinity.blocks.drawer.header" defaultMessage="Add new block" />
                <IconButton
                    onClick={onClose}
                    sx={(theme) => ({
                        color: theme.palette.common.white,
                    })}
                    size="large"
                >
                    <Close />
                </IconButton>
            </Header>
            <Content>
                <ContentItem>
                    <InputItem>
                        <InputBase
                            fullWidth
                            autoFocus
                            placeholder={intl.formatMessage({ id: "dextinity.blocks.drawer.searchField.placeholder", defaultMessage: "Search..." })}
                            startAdornment={
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            }
                            onChange={handleSearchFieldChange}
                            onKeyDown={handleSearchFieldKeyDown}
                            value={searchValue}
                        />
                    </InputItem>
                    <InputItem>
                        <FormControlLabel
                            control={<Checkbox checked={addAndEdit} onChange={handleAddAndEditChange} color="primary" />}
                            label={<FormattedMessage id="dextinity.blocks.drawer.addAndEdit" defaultMessage="add + edit" />}
                        />
                    </InputItem>
                </ContentItem>
                {categories.map((category) => {
                    if (category.blocks.length === 0) {
                        return null;
                    }

                    return (
                        <ContentItem key={category.id}>
                            <Typography variant="h4" gutterBottom>
                                {category.label}
                            </Typography>
                            <Paper elevation={0}>
                                <List disablePadding>
                                    {category.blocks.map(([type, block]) => (
                                        <ListItemButton key={type} divider onClick={() => handleListItemClick(type)}>
                                            {block.displayName}
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Paper>
                        </ContentItem>
                    );
                })}
            </Content>
        </Drawer>
    );
}

function isCustomBlockCategory(category: BlockCategory | CustomBlockCategory): category is CustomBlockCategory {
    return typeof category === "object";
}

function isFormattedMessage(node: ReactNode): node is ReactElement<MessageDescriptor> {
    return isValidElement(node) && node.type === FormattedMessage;
}

const Content = styled(DialogContent)`
    width: 380px;
`;

const Header = styled(DialogTitle)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    padding-left: 20px;
`;

const ContentItem = styled("div")`
    &:not(:last-child) {
        margin-bottom: 40px;
    }
`;

const InputItem = styled("div")`
    margin-bottom: 10px;
`;
