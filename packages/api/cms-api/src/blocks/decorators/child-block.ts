import { Transform } from "class-transformer";

import { type Block, isBlockDataInterface } from "../block.js";
import { BlockField } from "./field.js";

interface ChildBlockOptions {
    /**
     * @deprecated Nullable child blocks are not correctly supported in
     * the Admin, for instance, in `createCompositeBlock`. Save a
     * block's default values instead.
     */
    nullable?: boolean;
}
export function ChildBlock(block: Block, options?: ChildBlockOptions): PropertyDecorator {
    const nullable = options?.nullable ? true : false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (target: any, key: string | symbol) {
        BlockField({ type: "block", block, nullable })(target, key);
        Transform(
            ({ value }) =>
                isBlockDataInterface(value) ? value : nullable && (value === undefined || value === null) ? undefined : block.blockDataFactory(value),
            {
                toClassOnly: true,
            },
        )(target, key as string);
    };
}
