/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BlockInterface } from "../../types";
import type {
    BlockInterfaceWithOptions,
    CompositeBlocksConfig,
    CompositeOptions,
    DataMapInputApi,
    DataMapOutputApi,
    DataMapState,
    InputApiMap,
    OutputApiMap,
    StateMap,
} from "./types";

// reduce each block key to something
// supports flatten-mode
export function applyToCompositeBlocks<C extends CompositeBlocksConfig>(
    compositeBlocks: C,
    fn: (block: BlockInterfaceWithOptions, attr: keyof C) => any,
    { flatten }: { flatten?: boolean } = {},
): any {
    return Object.entries(compositeBlocks).reduce((acc, [attr, blockConfig]) => {
        const [block, options] = normalizedBlockConfig(blockConfig);
        const result = fn([block, options], attr);

        if (flatten && options.flatten) {
            return {
                ...acc,
                ...result,
            };
        } else {
            acc[attr] = result;
            return acc;
        }
    }, {} as any);
}

export async function applyToCompositeBlocksAsync(
    compositeBlocks: CompositeBlocksConfig,
    fn: (block: BlockInterfaceWithOptions, attr: string) => Promise<any>,
    { flatten }: { flatten?: boolean } = {},
): Promise<any> {
    let result: any = {};

    for (const [attr, blockConfig] of Object.entries(compositeBlocks)) {
        const [block, options] = normalizedBlockConfig(blockConfig);
        const value = await fn([block, options], attr);

        if (flatten && options.flatten) {
            result = {
                ...result,
                ...value,
            };
        } else {
            result[attr] = value;
        }
    }

    return result as any;
}

const defaultOptions: CompositeOptions = {};

export function normalizedBlockConfig(input: BlockInterface | BlockInterfaceWithOptions): BlockInterfaceWithOptions {
    if (Array.isArray(input)) {
        return [input[0], input[1] || defaultOptions] as BlockInterfaceWithOptions;
    } else {
        return [input, defaultOptions] as BlockInterfaceWithOptions;
    }
}

// takes the unpacked data (with flattened attributes) as argument
// takes an array of flattend attribute
// picks values for those attribute
export const createPickFlattedData =
    <C extends CompositeBlocksConfig>() =>
    <UnpackedData extends DataMapInputApi<C> | DataMapState<C> | DataMapOutputApi<C>, FlattenedAttributes extends Array<keyof UnpackedData>>(
        keys: FlattenedAttributes,
        data: UnpackedData,
    ): Partial<UnpackedData> => {
        return Object.entries(data).reduce((acc, [key, value]) => {
            if (keys.includes(key as keyof UnpackedData)) {
                return {
                    ...acc,
                    [key]: value,
                };
            }
            return acc;
        }, {} as Partial<UnpackedData>);
    };

// takes the unpacked data (with flattened attributes) as argument
// takes a blockKey,
// returns data for this block
export const createPackData =
    <C extends CompositeBlocksConfig>() =>
    <UnpackedData extends DataMapInputApi<C> | DataMapState<C> | DataMapOutputApi<C>, BlockKey extends keyof C>(
        [block, options]: BlockInterfaceWithOptions,
        attr: BlockKey,
        data: UnpackedData,
    ): InputApiMap<C>[BlockKey] | StateMap<C>[BlockKey] | OutputApiMap<C>[BlockKey] | undefined => {
        const pickFlattedData = createPickFlattedData<C>();
        if (options.flatten) {
            const keys = Object.keys(block.defaultValues() || {}) as Array<keyof UnpackedData>;
            const c = pickFlattedData(keys, data) as any;
            return c;
        } else {
            return data[attr as keyof UnpackedData]; // undefined is a valid value to be returned here
        }
    };
