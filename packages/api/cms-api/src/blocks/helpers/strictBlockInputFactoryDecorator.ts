import { type BlockInputFactory, type BlockInputInterface, isBlockInputInterface } from "../block.js";

// Decorates a BlockInputFactory to ensure that it is only applied on raw data
export function strictBlockInputFactoryDecorator<T extends BlockInputInterface = BlockInputInterface>(
    fn: BlockInputFactory<T>,
): BlockInputFactory<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoratedStrictBlockDataFactory: BlockInputFactory<T> = function decoratedSafeBlockDataFactory(value: any) {
        if (isBlockInputInterface(value)) {
            throw new Error(
                `Values which implement BlockInputInterface are not allowed as input for a blockInputFactory (${value.constructor.name})`,
            );
        }
        return fn(value);
    };

    return decoratedStrictBlockDataFactory;
}
