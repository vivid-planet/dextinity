import { describe, expect, it } from "vitest";

import { createBlocksBlock } from "../factories/createBlocksBlock";
import { FlatBlocks } from "./flat-blocks";
import { ABlock } from "./test/blocks/ABlock";
import { CBlock } from "./test/blocks/CBlock";

describe("FlatBlocks", () => {
    it("visits all BlockData-references breadth first", () => {
        const testBlock = ABlock.blockInputFactory({
            titleA: "a",
            b: { titleB: "b", c1: { titleC: "c1 in b" }, c2: { titleC: "c2 in b" } },
            c: { titleC: "c" },
        }).transformToBlockData();

        // Visit blocks
        const visitor = new FlatBlocks(testBlock);
        const nodes = visitor.breadthFirst();

        expect(nodes.length).toBe(5);

        // test breadth first
        expect(nodes[0].block).toBe(testBlock);
        expect(nodes[1].block).toBe(testBlock.b);
        expect(nodes[2].block).toBe(testBlock.c);
        expect(nodes[3].block).toBe(testBlock.b.c1);
        expect(nodes[4].block).toBe(testBlock.b.c2);

        // test  parent and level match
        expect(nodes[3]?.parent?.block).toBe(nodes[1].block);
        expect(nodes[3]?.level).toBe(2);

        expect(nodes[0].block).toBe(nodes[2]?.parent?.block);
        expect(nodes[2]?.level).toBe(1);

        expect(nodes[0]?.parent).toBe(null);
        expect(nodes[0]?.level).toBe(0);

        // test path
        expect(nodes[0]?.path).toStrictEqual(["root"]);
        expect(nodes[0]?.pathToString()).toBe("root");
        expect(nodes[2]?.path).toStrictEqual(["root", "c"]);
        expect(nodes[2]?.pathToString()).toBe("root.c");
        expect(nodes[3]?.path).toStrictEqual(["root", "b", "c1"]);
        expect(nodes[3]?.pathToString()).toBe("root.b.c1");
    });

    it("visits childblocks of blockBlock", () => {
        const TestBlock = createBlocksBlock({ supportedBlocks: { c: CBlock, c2: CBlock } }, "CBlocksBlock");
        const testBlock = TestBlock.blockInputFactory({
            blocks: [{ type: "c", key: "123", visible: true, props: { titleC: "titleC" } }],
        }).transformToBlockData();

        const visitor = new FlatBlocks(testBlock);
        const nodes = visitor.breadthFirst();

        expect(nodes[0]?.block.constructor.name).toBe("BlocksBlockData");
        expect(nodes[1]?.block.constructor.name).toBe("CBlockData");
    });
});
