import { Expose, Transform } from "class-transformer";
import { ValidateNested } from "class-validator";

import { type Block, isBlockInputInterface } from "../block.js";
import { BlockField } from "./field.js";

interface ChildBlockInputOptions {
    /**
     * @deprecated Nullable child blocks are not correctly supported in
     * the Admin, for instance, in `createCompositeBlock`. Save a
     * block's default values instead.
     */
    nullable?: boolean;
    disableValidateNested?: boolean; // Useful when a custom validation strategy is needed
}
export function ChildBlockInput(block: Block, options?: ChildBlockInputOptions): PropertyDecorator {
    const nullable = options?.nullable ? true : false;
    const disableValidateNested = options?.disableValidateNested ? true : false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (target: any, key: string | symbol) {
        if (!disableValidateNested) {
            ValidateNested()(target, key); // by default valdidate all child blocks
        }
        BlockField({ type: "block", block, nullable })(target, key);
        // We need add `@Expose()` to make sure that `@Transform()` is called even when no value is provided.
        // See https://github.com/typestack/class-transformer/issues/1599#issuecomment-2094934401.
        Expose()(target, key);
        Transform(
            ({ value }) => {
                if (isBlockInputInterface(value)) {
                    return value;
                } else if (nullable && value == null) {
                    return undefined;
                } else {
                    if (value == null) {
                        throw new Error(`Missing child block input for '${key as string}' (${block.name})`);
                    }

                    return block.blockInputFactory(value);
                }
            },
            {
                toClassOnly: true,
            },
        )(target, key as string);
    };
}
