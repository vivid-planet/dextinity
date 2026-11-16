import { type BlockDataFactory, type BlockDataInterface, isBlockDataInterface } from "../block.js";

// Decorates a BlockDataFactory to ensure that it is only applied on raw data
export function strictBlockDataFactoryDecorator<T extends BlockDataInterface>(fn: BlockDataFactory<T>): BlockDataFactory<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoratedStrictBlockDataFactory: BlockDataFactory<T> = function decoratedSafeBlockDataFactory(value: any) {
        if (isBlockDataInterface(value)) {
            throw new Error(`Values which implement BlockDataInterface are not allowed as input for a blockDataFactory (${value.constructor.name})`);
        }
        return fn(value);
    };

    return decoratedStrictBlockDataFactory;
}
