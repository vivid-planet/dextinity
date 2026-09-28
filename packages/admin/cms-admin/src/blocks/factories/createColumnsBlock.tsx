import { Field, StackPage, StackPageTitle, StackSwitch, StackSwitchApiContext } from "@dextinity/admin";
import { Add, Copy, Delete, Invisible, Paste, Visible } from "@dextinity/admin-icons";
import { Checkbox, Divider, FormControlLabel, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { FormattedMessage, type IntlShape, type MessageDescriptor, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { AdminComponentStickyFooter } from "../common/AdminComponentStickyFooter";
import { BlockAdminComponentButton } from "../common/BlockAdminComponentButton";
import { BlockAdminComponentPaper } from "../common/BlockAdminComponentPaper";
import { BlockAdminComponentSection } from "../common/BlockAdminComponentSection";
import { BlockPreviewContent } from "../common/blockRow/BlockPreviewContent";
import { BlockRow } from "../common/blockRow/BlockRow";
import { BlocksFinalForm } from "../form/BlocksFinalForm";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { deduplicateBlockDependencies } from "../helpers/deduplicateBlockDependencies";
import { HoverPreviewComponent } from "../iframebridge/HoverPreviewComponent";
import { SelectPreviewComponent } from "../iframebridge/SelectPreviewComponent";
import {
    BlockCategory,
    type BlockDependency,
    type BlockInputApi,
    type BlockInterface,
    type CustomBlockCategory,
    type PreviewContent,
} from "../types";
import { resolveNewState } from "../utils";
import { parallelAsyncEvery } from "../utils/parallelAsyncEvery";
import { FinalFormColumnsSelect } from "./columnsBlock/FinalFormColumnsSelect";
import { FinalFormLayoutSelect } from "./columnsBlock/FinalFormLayoutSelect";
import type { ListBlockItem, ListBlockState } from "./createListBlock";
import { createUseAdminComponent as createUseListBlockAdminComponent } from "./listBlock/createUseAdminComponent";

export interface ColumnsBlockLayout {
    name: string;
    columns: number;
    label: ReactNode;
    preview: ReactNode;
    section?:
        | string
        | {
              name: string;
              label?: ReactNode;
          };
}

interface ColumnsBlockFragment<T extends BlockInterface> {
    layout: string;
    columns: Array<{
        key: string;
        visible: boolean;
        props: BlockInputApi<T>;
    }>;
}

interface ColumnsBlockState<T extends BlockInterface> {
    layout: ColumnsBlockLayout;
    columns: ListBlockItem<T>[];
}

interface CreateColumnsBlockOptions<T extends BlockInterface> {
    name: string;
    displayName: ReactNode;
    category?: BlockCategory | CustomBlockCategory;
    contentBlock: T;
    layouts: ColumnsBlockLayout[];
    tags?: Array<MessageDescriptor | string>;
}

export function createColumnsBlock<T extends BlockInterface>(
    { name, displayName, category = BlockCategory.Layout, contentBlock, layouts, tags }: CreateColumnsBlockOptions<T>,
    override?: (
        block: BlockInterface<ColumnsBlockFragment<T>, ColumnsBlockState<T>, ColumnsBlockFragment<T>>,
    ) => BlockInterface<ColumnsBlockFragment<T>, ColumnsBlockState<T>, ColumnsBlockFragment<T>>,
): BlockInterface<ColumnsBlockFragment<T>, ColumnsBlockState<T>, ColumnsBlockFragment<T>> {
    if (layouts.length === 0) {
        throw new Error(`Number of layouts must be greater than 0!`);
    }

    const useListBlockAdminComponent = createUseListBlockAdminComponent({ block: contentBlock });

    function createEmptyColumns(number: number): ListBlockItem<T>[] {
        return new Array(number).fill(undefined).map(() => ({
            key: uuid(),
            props: contentBlock.defaultValues(),
            selected: false,
            slideIn: false,
            visible: true,
        }));
    }
    const ColumnsBlock: BlockInterface<ColumnsBlockFragment<T>, ColumnsBlockState<T>, ColumnsBlockFragment<T>> = {
        ...createBlockSkeleton(),

        name,

        displayName,

        tags: tags ? tags : contentBlock.tags,

        category,

        defaultValues: () => {
            const defaultLayout = layouts[0];

            const state: ColumnsBlockState<T> = {
                layout: defaultLayout,
                // Add empty columns so the list is not empty initially
                columns: createEmptyColumns(defaultLayout.columns),
            };

            return state;
        },

        input2State: (input) => {
            const layout = layouts.find((layout) => layout.name === input.layout);

            if (!layout) {
                throw new Error(`Unknown layout "${input.layout}"!`);
            }

            return {
                layout,
                columns: input.columns.map((column) => ({
                    key: column.key,
                    props: contentBlock.input2State(column.props),
                    selected: false,
                    slideIn: false,
                    visible: column.visible,
                })),
            };
        },

        state2Output: (output) => ({
            layout: output.layout.name,
            columns: output.columns.map((column) => ({
                key: column.key,
                visible: column.visible,
                props: contentBlock.state2Output(column.props),
            })),
        }),

        output2State: async (output, context) => {
            const layout = layouts.find((layout) => layout.name === output.layout);

            if (!layout) {
                throw new Error(`Unknown layout "${output.layout}"!`);
            }

            const state: ColumnsBlockState<T> = {
                layout,
                columns: [],
            };

            for (const columns of output.columns) {
                state.columns.push({
                    ...columns,
                    props: await contentBlock.output2State(columns.props, context),
                    selected: false,
                    slideIn: false,
                });
            }

            return state;
        },

        createPreviewState: (state, previewContext) => ({
            adminMeta: { route: previewContext.parentUrl },
            layout: state.layout.name,
            columns: state.columns
                .filter((c) => (previewContext.showVisibleOnly ? c.visible : true)) // depending on context show all blocks or only visible blocks
                .map((column) => {
                    const blockAdminRoute = `${previewContext.parentUrlSubRoute ?? previewContext.parentUrl}/${column.key}/edit`;

                    return {
                        key: column.key,
                        visible: column.visible,
                        props: contentBlock.createPreviewState(column.props, {
                            ...previewContext,
                            parentUrlSubRoute: undefined,
                            parentUrl: blockAdminRoute,
                        }),
                        adminRoute: blockAdminRoute,
                        adminMeta: { route: blockAdminRoute },
                    };
                }),
        }),

        isValid: (state) => parallelAsyncEvery(state.columns, (column) => contentBlock.isValid(column.props)),

        anchors: (state) => {
            return state.columns.reduce<string[]>((anchors, column) => {
                return [...anchors, ...(contentBlock.anchors?.(column.props) ?? [])];
            }, []);
        },

        dependencies: (state) => {
            const mergedDependencies = state.columns.reduce<BlockDependency[]>((dependencies, column) => {
                return [...dependencies, ...(contentBlock.dependencies?.(column.props) ?? [])];
            }, []);

            return deduplicateBlockDependencies(mergedDependencies);
        },

        replaceDependenciesInOutput: (output, replacements) => {
            const newOutput: ColumnsBlockFragment<T> = { ...output, columns: [] };

            for (const column of output.columns) {
                newOutput.columns.push({
                    ...column,
                    props: contentBlock.replaceDependenciesInOutput(column.props, replacements),
                });
            }

            return newOutput;
        },

        AdminComponent: ({ state, updateState }) => {
            const intl = useIntl();
            const groupLayoutsByColumnsApi = createGroupLayoutsByColumnsApi(layouts);
            const handleListBlockAdminChange: Dispatch<SetStateAction<ListBlockState<T>>> = (listBlockSetStateAction) => {
                updateState((prevState) => {
                    const listBlockState = resolveNewState({
                        prevState: { blocks: prevState.columns },
                        setStateAction: listBlockSetStateAction,
                    });
                    return {
                        ...prevState,
                        columns: listBlockState.blocks,
                    };
                });
            };
            const {
                cannotPasteBlockErrorDialog,
                createUpdateSubBlocksFn,
                updateClipboardContent,
                addNewBlock,
                copySelectedBlocks,
                deleteAllSelectedBlocks,
                selectBlock,
                handleToggleSelectAll,
                pasteBlock,
                selectedCount,
                deleteBlocks,
                toggleVisible,
            } = useListBlockAdminComponent({ state: { blocks: state.columns }, updateState: handleListBlockAdminChange });

            return (
                <>
                    <StackSwitch initialPage="list" disableForcePromptRoute>
                        <StackPage name="list">
                            <BlocksFinalForm<{ layout: ColumnsBlockLayout; columns: number }>
                                onSubmit={({ layout, columns }) => {
                                    updateState((prevState) => {
                                        const defaultLayoutForSelectedColumns = groupLayoutsByColumnsApi.getDefaultLayout(columns);
                                        const newLayout =
                                            layout.columns !== columns && defaultLayoutForSelectedColumns ? defaultLayoutForSelectedColumns : layout;
                                        const missingEmptyColumns =
                                            columns > prevState.columns.length ? createEmptyColumns(columns - prevState.columns.length) : [];
                                        return {
                                            ...prevState,
                                            layout: newLayout,
                                            columns: [...prevState.columns, ...missingEmptyColumns],
                                        };
                                    });
                                }}
                                initialValues={{ layout: state.layout, columns: state.layout.columns }}
                            >
                                <Field
                                    name="columns"
                                    label={<FormattedMessage id="dextinity.blocks.columns.columns" defaultMessage="Columns" />}
                                    component={FinalFormColumnsSelect}
                                    columns={groupLayoutsByColumnsApi.columns}
                                    fullWidth
                                />
                                <Field
                                    name="layout"
                                    label={<FormattedMessage id="dextinity.blocks.columns.layout" defaultMessage="Layout" />}
                                    component={FinalFormLayoutSelect}
                                    layouts={groupLayoutsByColumnsApi.getLayouts(state.layout.columns)}
                                    fullWidth
                                />
                            </BlocksFinalForm>
                            <BlockAdminComponentSection title={<FormattedMessage id="dextinity.blocks.columns.items" defaultMessage="Items" />}>
                                <BlockAdminComponentPaper disablePadding>
                                    <StackSwitchApiContext.Consumer>
                                        {(stackApi) => {
                                            return (
                                                <SelectPreviewComponent>
                                                    <BlockListHeader>
                                                        {state.columns.length ? (
                                                            <SelectAllFromControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={selectedCount === state.columns.length && selectedCount > 0}
                                                                        indeterminate={selectedCount > 0 && selectedCount !== state.columns.length}
                                                                        onChange={handleToggleSelectAll}
                                                                    />
                                                                }
                                                                label={
                                                                    <FormattedMessage
                                                                        id="dextinity.blocks.list.selectAll"
                                                                        defaultMessage="Select all"
                                                                    />
                                                                }
                                                            />
                                                        ) : (
                                                            <div />
                                                        )}
                                                        <BlockListHeaderActionContainer>
                                                            {selectedCount > 0 && (
                                                                <>
                                                                    <IconButton onClick={deleteAllSelectedBlocks} size="large">
                                                                        <Delete />
                                                                    </IconButton>
                                                                    <IconButton onClick={copySelectedBlocks} size="large">
                                                                        <Copy />
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                            <IconButton onClick={() => pasteBlock(0)} size="large">
                                                                <Paste />
                                                            </IconButton>
                                                        </BlockListHeaderActionContainer>
                                                    </BlockListHeader>

                                                    <Divider />
                                                    <div>
                                                        {state.columns.map((column, columnIndex) => {
                                                            return (
                                                                <HoverPreviewComponent key={column.key} componentSlug={`${column.key}/content`}>
                                                                    <BlockRow
                                                                        id={column.key}
                                                                        renderPreviewContent={() => (
                                                                            <BlockPreviewContent block={contentBlock} state={column.props} />
                                                                        )}
                                                                        index={columnIndex}
                                                                        onContentClick={() => {
                                                                            stackApi.activatePage("edit", column.key);
                                                                        }}
                                                                        onDeleteClick={() => {
                                                                            deleteBlocks([column.key]);
                                                                        }}
                                                                        moveBlock={(from, to) => {
                                                                            updateState((prevState) => {
                                                                                const columns = [...prevState.columns];
                                                                                const columnToMove = columns.splice(from, 1)[0];
                                                                                columns.splice(to, 0, columnToMove);
                                                                                return { ...prevState, columns };
                                                                            });
                                                                        }}
                                                                        visibilityButton={
                                                                            <IconButton onClick={() => toggleVisible(column.key)} size="small">
                                                                                {column.visible ? (
                                                                                    <Visible color="success" />
                                                                                ) : (
                                                                                    <Invisible color="action" />
                                                                                )}
                                                                            </IconButton>
                                                                        }
                                                                        onAddNewBlock={(beforeIndex) => {
                                                                            const key = addNewBlock(beforeIndex);
                                                                            stackApi.activatePage("edit", key);
                                                                        }}
                                                                        onCopyClick={() => {
                                                                            updateClipboardContent([
                                                                                {
                                                                                    name: contentBlock.name,
                                                                                    visible: column.visible,
                                                                                    state: column.props,
                                                                                },
                                                                            ]);
                                                                        }}
                                                                        onPasteClick={() => {
                                                                            pasteBlock(columnIndex + 1);
                                                                        }}
                                                                        selected={column.selected}
                                                                        onSelectedClick={(selected) => {
                                                                            selectBlock(column, selected);
                                                                        }}
                                                                        isValidFn={() => contentBlock.isValid(column.props)}
                                                                        slideIn={column.slideIn}
                                                                        hideBottomInsertBetweenButton={columnIndex >= state.columns.length - 1}
                                                                    />
                                                                </HoverPreviewComponent>
                                                            );
                                                        })}
                                                    </div>
                                                    {state.columns.length === 0 ? (
                                                        <BlockAdminComponentButton
                                                            variant="primary"
                                                            onClick={() => {
                                                                const key = addNewBlock();
                                                                stackApi.activatePage("edit", key);
                                                            }}
                                                            size="large"
                                                        >
                                                            <LargeAddButtonContent>
                                                                <LargeAddButtonIcon />
                                                                <Typography>
                                                                    <FormattedMessage
                                                                        id="dextinity.blocks.columns.addItem"
                                                                        defaultMessage="Add item"
                                                                    />
                                                                </Typography>
                                                            </LargeAddButtonContent>
                                                        </BlockAdminComponentButton>
                                                    ) : (
                                                        <AdminComponentStickyFooter>
                                                            <BlockAdminComponentButton
                                                                variant="primary"
                                                                onClick={() => {
                                                                    const key = addNewBlock();
                                                                    stackApi.activatePage("edit", key);
                                                                }}
                                                                size="large"
                                                                startIcon={<Add />}
                                                            >
                                                                <FormattedMessage id="dextinity.blocks.columns.addItem" defaultMessage="Add item" />
                                                            </BlockAdminComponentButton>
                                                        </AdminComponentStickyFooter>
                                                    )}
                                                </SelectPreviewComponent>
                                            );
                                        }}
                                    </StackSwitchApiContext.Consumer>
                                </BlockAdminComponentPaper>
                            </BlockAdminComponentSection>
                        </StackPage>
                        <StackPage
                            name="edit"
                            title={intl.formatMessage({ id: "dextinity.blocks.columns.editColumn", defaultMessage: "Edit column" })}
                        >
                            {(key) => {
                                const matchIndex = state.columns.findIndex((column) => column.key === key);

                                if (matchIndex === -1) {
                                    return <FormattedMessage id="dextinity.blocks.columns.unknownColumn" defaultMessage="Can't find column" />;
                                }

                                const match = state.columns[matchIndex];

                                return (
                                    <StackPageTitle title={columnCountLabel(intl, matchIndex + 1)}>
                                        <contentBlock.AdminComponent state={match.props} updateState={createUpdateSubBlocksFn(key)} />
                                    </StackPageTitle>
                                );
                            }}
                        </StackPage>
                    </StackSwitch>
                    {cannotPasteBlockErrorDialog}
                </>
            );
        },

        previewContent: (state, context) => {
            if (state.columns.length === 0) {
                return [
                    {
                        type: "text",
                        content: <FormattedMessage id="dextinity.blocks.columns.noColumns" defaultMessage="No columns" />,
                    },
                ];
            }

            return state.columns.reduce<PreviewContent[]>(
                (previewContent, currentColumn) => [...previewContent, ...contentBlock.previewContent(currentColumn.props, context)],
                [],
            );
        },

        resolveDependencyPath: (state, jsonPath) => {
            if (!/^columns.\d+.props/.test(jsonPath)) {
                throw new Error("ColumnsBlock: Invalid jsonPath");
            }

            const pathArr = jsonPath.split(".");
            const num = Number(pathArr[1]);
            const blockItem = state.columns[num];

            const childPath = contentBlock.resolveDependencyPath(blockItem.props, pathArr.slice(3).join("."));
            return `${blockItem.key}/edit/${childPath}`;
        },

        extractTextContents: (state, options) => {
            const includeInvisibleContent = options?.includeInvisibleContent ?? false;

            return state.columns.reduce<string[]>((content, column) => {
                if (!column.visible && !includeInvisibleContent) {
                    return content;
                }

                return [...content, ...(contentBlock.extractTextContents?.(column.props, options) ?? [])];
            }, []);
        },
        translateContent: async (state, translate) => {
            const translatedColumns = await Promise.all(
                state.columns.map(async (column) => {
                    const translatedProps = contentBlock.translateContent
                        ? await contentBlock.translateContent(column.props, translate)
                        : column.props;
                    return { ...column, props: translatedProps };
                }),
            );
            return { ...state, columns: translatedColumns };
        },
    };

    if (override) {
        return override(ColumnsBlock);
    }

    return ColumnsBlock;
}

const BlockListHeader = styled("div")`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const BlockListHeaderActionContainer = styled("div")`
    padding: 12px 0;
`;

const SelectAllFromControlLabel = styled(FormControlLabel)`
    padding: 15px 10px 15px 7px;
`;

const LargeAddButtonContent = styled("span")`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0;
`;

const LargeAddButtonIcon = styled(Add)`
    font-size: 24px;
    margin-bottom: 8px;
`;

type GroupedLayoutsByColumnsApi = {
    columns: number[];
    getLayouts: (columns: number) => ColumnsBlockLayout[];
    getDefaultLayout: (columns: number) => ColumnsBlockLayout | undefined;
};

function columnCountLabel(intl: IntlShape, count: number): string {
    return intl.formatMessage(
        {
            id: "dextinity.blocks.columns.columnTitle",
            defaultMessage: "Column {number}",
        },
        { number: count },
    );
}

function createGroupLayoutsByColumnsApi(layouts: ColumnsBlockLayout[]): GroupedLayoutsByColumnsApi {
    const groupedLayouts = layouts.reduce((acc, c) => {
        acc.set(c.columns, [...(acc.get(c.columns) || []), c]);
        return acc;
    }, new Map<number, ColumnsBlockLayout[]>());

    return {
        columns: Array.from(groupedLayouts.keys()),
        getLayouts: (columns: number) => {
            return groupedLayouts.get(columns) || [];
        },
        getDefaultLayout: (columns: number) => {
            const layouts = groupedLayouts.get(columns) || [];
            return layouts.length ? layouts[0] : undefined;
        },
    };
}
