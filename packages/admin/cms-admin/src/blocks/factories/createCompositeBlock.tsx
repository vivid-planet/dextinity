import { StackPage, StackSwitch, StackSwitchApiContext, SubRoute, useSubRoutePrefix } from "@dextinity/admin";
import { Divider } from "@mui/material";
import { Fragment, type ReactNode } from "react";
import { FormattedMessage, type MessageDescriptor } from "react-intl";

import { BlockAdminComponentNestedButton } from "../common/BlockAdminComponentNestedButton";
import { BlockAdminComponentPaper, useBlockAdminComponentPaper } from "../common/BlockAdminComponentPaper";
import { BlockAdminComponentSection } from "../common/BlockAdminComponentSection";
import { BlockAdminComponentSectionGroup } from "../common/BlockAdminComponentSectionGroup";
import { HiddenInSubroute } from "../common/HiddenInSubroute";
import { useBlockContext } from "../context/useBlockContext";
import { composeBlocks, type CompositeBlockInterface } from "../helpers/composeBlocks/composeBlocks";
import type { BlockInterfaceWithOptions } from "../helpers/composeBlocks/types";
import { normalizedBlockConfig } from "../helpers/composeBlocks/utils";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { isBlockInterface } from "../helpers/isBlockInterface";
import { HoverPreviewComponent } from "../iframebridge/HoverPreviewComponent";
import { BlockCategory, type BlockInputApi, type BlockInterface, type BlockOutputApi, type BlockState, type CustomBlockCategory } from "../types";

interface BlockConfiguration {
    /**
     * User facing label displayed above the block.
     */
    title?: ReactNode;
    /**
     * Render the block as a nested page with a navigation button instead of displaying it inline.
     */
    nested?: boolean;
    /**
     * The block to render.
     */
    block: BlockInterface | BlockInterfaceWithOptions;
    /**
     * Hides this block when navigating into a sibling block's sub-route (e.g., when editing items of a list block).
     */
    hiddenInSubroute?: boolean;
    divider?: boolean;
    /**
     * Wrap the block within a paper for visual grouping.
     */
    paper?: boolean;
    /**
     * Conditionally hide the block based on it's current state. Return `true` to hide.
     */
    hiddenForState?: (state: unknown) => boolean;
}

interface GroupConfiguration {
    /**
     * The blocks to render.
     */
    blocks: Record<string, BlockConfiguration>;
    /**
     * User facing section headline displayed above the group, more prominent than the individual block's titles.
     */
    title?: ReactNode;
    /**
     * Wrap the group's within a paper for visual grouping.
     */
    paper?: boolean;
}

interface NormalizedBlockConfiguration extends BlockConfiguration {
    block: BlockInterfaceWithOptions;
}

interface CreateCompositeBlockOptionsBase {
    /**
     * Unique identifier for the block. Must match the name used in the API and Site.
     */
    name: string;
    /**
     * User-facing label shown in the Add Block Drawer.
     */
    displayName: ReactNode;
    /**
     * Category under which the block appears in the Add Block Drawer.
     */
    category?: BlockCategory | CustomBlockCategory;
    adminLayout?: "stacked";
    blocks: Record<string, BlockConfiguration>;
    /**
     * Tags used for searching in the Add Block Drawer.
     */
    tags?: Array<MessageDescriptor | string>;
    /**
     * Function to determine the order of the blocks in the admin component. If a block is not included in the array, it will not be rendered.
     * @param state The current state of the composite block
     * @returns An array of block keys in the order they should be rendered in the admin component, if undefined all blocks will be rendered in the order they are defined in the blocks object
     */
    visibleOrderedBlocksForState?: (state: unknown) => string[] | undefined;
}

type CreateCompositeBlockOptionsWithGroups = Omit<CreateCompositeBlockOptionsBase, "blocks"> & { groups: Record<string, GroupConfiguration> };

type CreateCompositeBlockOptions = CreateCompositeBlockOptionsBase | CreateCompositeBlockOptionsWithGroups;

const hasGroups = (options: CreateCompositeBlockOptions): options is CreateCompositeBlockOptionsWithGroups => "groups" in options;

type ExtractCompositeBlocksConfigBase<T extends Record<string, { block: BlockInterface | BlockInterfaceWithOptions }>> = {
    [K in keyof T]: T[K]["block"];
};

// Inspired by https://dev.to/lucianbc/union-type-merging-in-typescript-9al
type ExtractGroupConfigs<T extends Record<string, GroupConfiguration>> = T[keyof T];
type AllBlockKeys<T> = T extends Record<string, BlockConfiguration> ? keyof T : never;
type MergeBlockConfigs<T extends Record<string, BlockConfiguration>> = {
    [BlockKey in AllBlockKeys<T>]: NonNullable<ExtractBlockConfig<T, BlockKey>>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PickType<T, K extends AllBlockKeys<T>> = T extends { [k in K]?: any } ? T[K] : undefined;
type ExtractBlockConfig<T extends Record<string, BlockConfiguration>, K extends AllBlockKeys<T>> = PickType<T, K>;

type ExtractCompositeBlocksConfig<Options extends CreateCompositeBlockOptions> = Options extends CreateCompositeBlockOptionsWithGroups
    ? ExtractCompositeBlocksConfigBase<MergeBlockConfigs<ExtractGroupConfigs<Options["groups"]>["blocks"]>>
    : Options extends CreateCompositeBlockOptionsBase
      ? ExtractCompositeBlocksConfigBase<Options["blocks"]>
      : never;

export const createCompositeBlock = <Options extends CreateCompositeBlockOptions>(
    options: Options,
    override?: (
        block: CompositeBlockInterface<ExtractCompositeBlocksConfig<Options>>,
    ) => CompositeBlockInterface<ExtractCompositeBlocksConfig<Options>>,
): CompositeBlockInterface<ExtractCompositeBlocksConfig<Options>> => {
    const { name, displayName, category = BlockCategory.Other, tags, visibleOrderedBlocksForState } = options;

    let groups: Record<string, GroupConfiguration>;

    if (hasGroups(options)) {
        groups = options.groups;
    } else {
        groups = { default: { blocks: options.blocks } };
    }

    const blockConfigs: Record<string, BlockConfiguration> = Object.values(groups).reduce((blocks, group) => ({ ...blocks, ...group.blocks }), {});

    const childTags = Object.values(blockConfigs).reduce<Array<MessageDescriptor | string>>((acc, blockConfig) => {
        const [blockInterface] = normalizedBlockConfig(blockConfig.block);
        if (isBlockInterface(blockInterface) && blockInterface.tags) {
            return [...acc, ...blockInterface.tags];
        }
        return acc;
    }, []);

    // internally use the lower level composeBlocks-api
    const {
        api: { adminComponents, childBlockCounts, isValids, previews },
        block,
    } = composeBlocks<ExtractCompositeBlocksConfig<Options>>(
        Object.entries(blockConfigs).reduce(
            (a, [key, { block }]) => ({
                ...a,
                [key]: block,
            }),
            {} as ExtractCompositeBlocksConfig<Options>,
        ),
    );

    // for easier usage, make sure each blockConfig has the same shape (BlockInterfaceWithOptions)
    const blockConfigNormalized = Object.entries(blockConfigs).reduce(
        (acc, [key, value]) => {
            return { ...acc, [key]: { ...value, block: normalizedBlockConfig(value.block) } };
        },
        {} as Record<string, NormalizedBlockConfiguration>,
    );

    const CompositeBlock: BlockInterface<BlockInputApi<typeof block>, BlockState<typeof block>, BlockOutputApi<typeof block>> = {
        ...createBlockSkeleton(),
        ...block, // merge in the blockMethods provided by the composeBlocks-api

        name,

        displayName,

        category,

        tags: tags ? tags : childTags,

        createPreviewState: (state, previewContext) => {
            const blockPreviewState = block.createPreviewState(state, previewContext);

            Object.entries(blockConfigNormalized).forEach(([attr, block]) => {
                const [extractedBlock] = block.block;
                if (block.nested === true && isBlockInterface(extractedBlock)) {
                    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
                    const blockState: any = (state as any)[attr];

                    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
                    (blockPreviewState as any)[attr] = extractedBlock.createPreviewState(blockState, {
                        ...previewContext,
                        parentUrl: `${previewContext.parentUrlSubRoute ?? previewContext.parentUrl}/${attr}/${attr}`,
                    });
                } else if ((block.nested == null || !block.nested) && isBlockInterface(extractedBlock)) {
                    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
                    const blockState: any = (state as any)[attr];

                    const embeddedBlockState = extractedBlock.createPreviewState(blockState, {
                        ...previewContext,
                        parentUrlSubRoute: `${previewContext.parentUrl}/${attr}`,
                        parentUrl: `${previewContext.parentUrl}`,
                    });
                    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
                    (blockPreviewState as any)[attr] = { ...embeddedBlockState, adminMeta: { route: `${previewContext.parentUrl}#${attr}` } };
                }
            });
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            return { ...(blockPreviewState as any), adminMeta: { route: previewContext.parentUrl } };
        },
        AdminComponent: ({ state, updateState }) => {
            const urlPrefix = useSubRoutePrefix();
            const isInPaper = useBlockAdminComponentPaper();
            const blockAdminComponents = adminComponents({ state, updateState });
            const context = useBlockContext();
            const blockPreviews = previews(state, context);
            const blockChildBlockCounts = childBlockCounts(state);
            const blockIsValids = isValids(state);

            const nestedBlocks = Object.entries(blockConfigNormalized).filter(([, { nested }]) => nested === true);

            const renderBlock = (blockKey: string, group: GroupConfiguration) => {
                const {
                    block: [block],
                    title,
                    nested,
                    hiddenInSubroute,
                    divider,
                    paper,
                    hiddenForState,
                } = blockConfigNormalized[blockKey];

                if (hiddenForState?.(state)) {
                    return null;
                }

                const sectionVariant = group.paper ? "dense" : "normal";
                const showDivider = divider && (isInPaper || group.paper);

                let children: ReactNode;

                if (nested) {
                    children = (
                        <StackSwitchApiContext.Consumer>
                            {(stackApi) => (
                                <HoverPreviewComponent key={blockKey} componentSlug={`${blockKey}/${blockKey}`}>
                                    <BlockAdminComponentNestedButton
                                        displayName={
                                            isBlockInterface(block) ? (
                                                block.displayName
                                            ) : (
                                                <FormattedMessage id="dextinity.blocks.createCompositeBlock.settings" defaultMessage="Settings" />
                                            )
                                        }
                                        preview={blockPreviews[blockKey]}
                                        count={blockChildBlockCounts[blockKey]}
                                        onClick={() => stackApi.activatePage(blockKey, blockKey)}
                                        isValid={blockIsValids[blockKey]}
                                    />
                                </HoverPreviewComponent>
                            )}
                        </StackSwitchApiContext.Consumer>
                    );
                } else {
                    children = (
                        <HoverPreviewComponent key={blockKey} componentSlug={`#${blockKey}`}>
                            <SubRoute path={`${urlPrefix}/${blockKey}`}>{blockAdminComponents[blockKey]}</SubRoute>
                        </HoverPreviewComponent>
                    );
                }

                const Container = nested || hiddenInSubroute ? HiddenInSubroute : Fragment;

                if (paper) {
                    return (
                        <Container key={blockKey}>
                            <BlockAdminComponentSection
                                title={block.definesOwnTitle ? null : title}
                                variant={sectionVariant}
                                disableBottomMargin={showDivider}
                            >
                                <BlockAdminComponentPaper disablePadding={block.definesOwnPadding}>{children}</BlockAdminComponentPaper>
                            </BlockAdminComponentSection>
                        </Container>
                    );
                }

                return (
                    <Container key={blockKey}>
                        <BlockAdminComponentSection
                            title={block.definesOwnTitle ? null : title}
                            variant={sectionVariant}
                            disableBottomMargin={showDivider}
                        >
                            {children}
                        </BlockAdminComponentSection>
                        {showDivider && <Divider />}
                    </Container>
                );
            };

            return (
                <StackSwitch disableForcePromptRoute>
                    {[
                        <StackPage name="initial" key="initial">
                            {Object.entries(groups).map(([groupKey, group]) => {
                                const { title, paper, blocks } = group;
                                const blockKeys = visibleOrderedBlocksForState?.(state) ?? Object.keys(blocks);
                                const children = blockKeys.map((blockKey) => <Fragment key={blockKey}>{renderBlock(blockKey, group)}</Fragment>);

                                const hiddenInSubroute = Object.values(blocks).every(
                                    (blockConfig) => blockConfig.hiddenInSubroute || blockConfig.nested,
                                );

                                const Container = hiddenInSubroute ? HiddenInSubroute : Fragment;

                                if (paper) {
                                    const definesOwnPadding = Object.values(blocks).every((blockConfig) => {
                                        const [blockInterface] = normalizedBlockConfig(blockConfig.block);
                                        return blockInterface.definesOwnPadding;
                                    });

                                    return (
                                        <Container key={groupKey}>
                                            <BlockAdminComponentSectionGroup title={title}>
                                                <BlockAdminComponentPaper disablePadding={definesOwnPadding}>{children}</BlockAdminComponentPaper>
                                            </BlockAdminComponentSectionGroup>
                                        </Container>
                                    );
                                }

                                return (
                                    <Container key={groupKey}>
                                        <BlockAdminComponentSectionGroup title={title}>{children}</BlockAdminComponentSectionGroup>
                                    </Container>
                                );
                            })}
                        </StackPage>,
                        ...nestedBlocks.map(([key, { title }]) => {
                            const block = blockConfigNormalized[key].block[0];

                            // @TODO: change literal string "Settings" on next line to: <FormattedMessage id="dextinity.blocks.createCompositeBlock.settings" defaultMessage="Settings" />
                            // when https://github.com/vivid-planet/dextinity/pull/340 is fixed
                            return (
                                <StackPage key={key} name={key} title={title ? title : isBlockInterface(block) ? block.displayName : "Settings"}>
                                    {blockAdminComponents[key]}
                                </StackPage>
                            );
                        }),
                    ]}
                </StackSwitch>
            );
        },
        resolveDependencyPath: (state, jsonPath) => {
            const key = jsonPath.split(".")[0];

            const route = [];

            const childPath = block.resolveDependencyPath(state, jsonPath);
            if (blockConfigNormalized[key].nested) {
                route.push(key, key);
            } else if (childPath.length > 0) {
                route.push(key);
            }

            route.push(childPath);

            return route.join("/");
        },
    };
    // allows to "fine-tune" the block with the product of the factory as argument
    // @TODO: this override-fn should be the 2nd argument (1st argument are factory-options) in every block factory!
    if (override) {
        return override(CompositeBlock);
    }
    return CompositeBlock;
};
