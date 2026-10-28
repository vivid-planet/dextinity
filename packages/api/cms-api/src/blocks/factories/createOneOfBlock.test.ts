import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../../page-tree/blocks/internal-link.block";
import { BlockMetaFieldKind } from "../block";
import { ExternalLinkBlock } from "../externalLink/external-link.block";
import { createOneOfBlock } from "./createOneOfBlock";

const validationOptions = { whitelist: true, forbidNonWhitelisted: true };

describe("createOneOfBlock", () => {
    it("should include attachedBlocks in the block input meta", () => {
        const supportedBlocks = { internal: InternalLinkBlock, external: ExternalLinkBlock };
        const OneOfBlock = createOneOfBlock({ supportedBlocks }, "OneOfBlockInputMetaTest");

        expect(OneOfBlock.blockInputMeta.fields).toEqual([
            {
                name: "attachedBlocks",
                kind: BlockMetaFieldKind.NestedObjectList,
                object: {
                    fields: [
                        { name: "type", kind: BlockMetaFieldKind.String, nullable: false },
                        { name: "props", kind: BlockMetaFieldKind.OneOfBlocks, blocks: supportedBlocks, nullable: false },
                    ],
                },
                nullable: false,
            },
            { name: "activeType", kind: BlockMetaFieldKind.String, nullable: true },
        ]);
    });

    describe("input validation", () => {
        const OneOfBlock = createOneOfBlock(
            { supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock } },
            "OneOfBlockInputValidationTest",
        );

        it("should explain an empty one-of block that must not be empty", async () => {
            const RequiredOneOfBlock = createOneOfBlock(
                { supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock }, allowEmpty: false },
                "RequiredOneOfBlockInputValidationTest",
            );

            const errors = await validate(RequiredOneOfBlock.blockInputFactory({ attachedBlocks: [] }), validationOptions);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints?.arrayMinSize).toBe(
                'attachedBlocks must not be empty. A one-of block lists its variants in "attachedBlocks" as { "type", "props" } and names the active one in "activeType".',
            );
        });

        it.each(["unknown", "toString"])("should report the unknown type '%s' at the index of the input", async (type) => {
            const input = OneOfBlock.blockInputFactory({
                attachedBlocks: [
                    { type: "external", props: { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false } },
                    { type, props: {} },
                ],
                activeType: "external",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            const errors = await validate(input, validationOptions);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe("attachedBlocks");
            expect(errors[0].children).toHaveLength(1);
            expect(errors[0].children?.[0].property).toBe("1");
            expect(errors[0].children?.[0].children).toHaveLength(1);
            expect(errors[0].children?.[0].children?.[0]).toMatchObject({ property: "type", constraints: { isIn: expect.any(String) } });
        });

        it.each(["abc", {}])("should report attachedBlocks that aren't an array (%j)", async (attachedBlocks) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const input = OneOfBlock.blockInputFactory({ attachedBlocks } as any);

            const errors = await validate(input, validationOptions);

            expect(errors).toHaveLength(1);
            expect(errors[0]).toMatchObject({ property: "attachedBlocks", constraints: { isArray: expect.any(String) } });
        });

        it("should report an item that is an array", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const input = OneOfBlock.blockInputFactory({ attachedBlocks: [[]] } as any);

            const errors = await validate(input, validationOptions);

            expect(errors).toHaveLength(1);
            expect(errors[0]).toMatchObject({ property: "attachedBlocks", constraints: { isObject: expect.any(String) } });
        });
    });
});
