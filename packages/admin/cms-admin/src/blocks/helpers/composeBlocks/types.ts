/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Dispatch, ReactNode, SetStateAction } from "react";

import type { AnonymousBlockInterface, BlockInputApi, BlockInterface, BlockOutputApi, BlockState } from "../../types";
import type { Flatten, KeysMatching } from "./utility-types";

export interface CompositeOptions {
    flatten?: boolean;
}
// composeBlocks accepts now both types, either a plain BlockInterface (like before), or a BlockInterface With Options
export type BlockInterfaceWithOptions = [AnonymousBlockInterface | BlockInterface, CompositeOptions];
export type CompositeBlocksConfig = Record<string, BlockInterface | BlockInterfaceWithOptions>;

type CompositeBlocks = Record<string, BlockInterface | AnonymousBlockInterface>;

// utility to extract the raw BlockInterface (without possible Options) out of the CompositeBlocksConfig
type ExtractCompositeBlock<T extends BlockInterface | BlockInterfaceWithOptions> = T extends BlockInterface ? T : T extends any[] ? T[0] : never;
type ExtractCompositeBlocks<C extends CompositeBlocksConfig> = {
    [K in keyof C]: ExtractCompositeBlock<C[K]>;
};

// some blocks have a flattend structure (typically setting-blocks), some not (previous behavior)
// these 2 Utilities extract the keys for either blocks that are flattend or that are not
type KeysWithFlattenedState<C extends CompositeBlocksConfig> = KeysMatching<C, [AnonymousBlockInterface, { flatten: true }]>;
type KeysWithoutFlattenedState<C extends CompositeBlocksConfig> = Exclude<keyof C, KeysWithFlattenedState<C>>;

// Data shape for all 3 representations of the block-data (input, state, output)
// It maps the data nodes depending on the setting (flatten or not) of the block
type AbstractDataMap<
    C extends CompositeBlocksConfig,
    DataMap extends InputApiMap<ExtractCompositeBlocks<C>> | StateMap<ExtractCompositeBlocks<C>> | OutputApiMap<ExtractCompositeBlocks<C>>,
> = Pick<DataMap, KeysWithoutFlattenedState<C>> & Flatten<Pick<DataMap, KeysWithFlattenedState<C>>>;

// concrete DataMaps for all 3 representations of the block-data (input, state, output)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type DataMapInputApi<C extends CompositeBlocksConfig> = AbstractDataMap<C, InputApiMap<C>>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type DataMapState<C extends CompositeBlocksConfig> = AbstractDataMap<C, StateMap<C>>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type DataMapOutputApi<C extends CompositeBlocksConfig> = AbstractDataMap<C, OutputApiMap<C>>;

// utilities which represent the unflattend shape for all 3 representations of the block-data (input, state, output)
export type InputApiMap<C extends CompositeBlocksConfig> = InputApiMapByCompositeBlocks<ExtractCompositeBlocks<C>>;
type InputApiMapByCompositeBlocks<C extends CompositeBlocks> = {
    [K in keyof C]: BlockInputApi<C[K]>;
};

export type StateMap<C extends CompositeBlocksConfig> = StateMapByCompositeBlocks<ExtractCompositeBlocks<C>>;
type StateMapByCompositeBlocks<C extends CompositeBlocks> = {
    [K in keyof C]: BlockState<C[K]>;
};

export type OutputApiMap<C extends CompositeBlocksConfig> = OutputApiMapByCompositeBlocks<ExtractCompositeBlocks<C>>;
type OutputApiMapByCompositeBlocks<C extends CompositeBlocks> = {
    [K in keyof C]: BlockOutputApi<C[K]>;
};

// shapes exposed by the composeBlocks Api, those cannot be flattend
export type AdminComponentPropsMap<C extends CompositeBlocksConfig> = AdminComponentPropsMapByCompositeBlocks<ExtractCompositeBlocks<C>>;
type AdminComponentPropsMapByCompositeBlocks<C extends CompositeBlocks> = {
    [K in keyof C]: {
        state: BlockState<C[K]>;
        updateState: Dispatch<SetStateAction<BlockState<C[K]>>>;
    };
};

export type AdminComponentsMap<C extends CompositeBlocksConfig> = AdminComponentsMapByCompositeBlocks<ExtractCompositeBlocks<C>>;
type AdminComponentsMapByCompositeBlocks<C extends CompositeBlocks> = {
    [K in keyof C]: ReactNode;
};

export type PreviewMap<C extends CompositeBlocksConfig> = PreviewMapByCompositeBlocks<ExtractCompositeBlocks<C>>;
type PreviewMapByCompositeBlocks<C extends CompositeBlocks> = {
    [K in keyof C]: ReactNode;
};

export type ChildBlockCountMap<C extends CompositeBlocksConfig> = ChildBlockCountMapByCompositeBlocks<ExtractCompositeBlocks<C>>;
type ChildBlockCountMapByCompositeBlocks<C extends CompositeBlocks> = {
    [K in keyof C]: number | undefined;
};

export type IsValidMap<C extends CompositeBlocksConfig> = IsValidMapByCompositeBlocks<ExtractCompositeBlocks<C>>;
type IsValidMapByCompositeBlocks<C extends CompositeBlocks> = {
    [K in keyof C]: () => Promise<boolean>;
};
