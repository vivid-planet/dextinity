import type { Block } from "../block";

export const ROOT_BLOCK_METADATA_KEY = "data:rootBlock";
export const ROOT_BLOCK_KEYS_METADATA_KEY = "keys:rootBlock";

export function RootBlock(block: Block): PropertyDecorator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (target: any, propertyKey: string | symbol) {
        Reflect.defineMetadata(ROOT_BLOCK_METADATA_KEY, block, target, propertyKey);

        const propertyKeys =
            Reflect.getOwnMetadata(ROOT_BLOCK_KEYS_METADATA_KEY, target) ||
            (Reflect.getMetadata(ROOT_BLOCK_KEYS_METADATA_KEY, target) || []).slice(0);
        propertyKeys.push(propertyKey);
        Reflect.defineMetadata(ROOT_BLOCK_KEYS_METADATA_KEY, propertyKeys, target);
    };
}
