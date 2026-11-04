import type { Block, ExtractBlockInputFactoryProps } from "@dextinity/cms-api";

export type BlockFixture = { generateBlockInput: () => Promise<ExtractBlockInputFactoryProps<Block>> };
