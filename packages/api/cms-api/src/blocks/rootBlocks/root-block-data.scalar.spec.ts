import { NestFactory } from "@nestjs/core";
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory, Query } from "@nestjs/graphql";
import { beforeEach, describe, expect, it } from "vitest";

import { PixelImageBlock } from "../../dam/blocks/pixel-image.block";
import { RootBlockDataScalar } from "./root-block-data.scalar";

let gqlSchemaFactory: GraphQLSchemaFactory;

describe("RootBlockDataScalar", () => {
    beforeEach(async () => {
        const app = await NestFactory.create(GraphQLSchemaBuilderModule, { logger: false });
        await app.init();

        gqlSchemaFactory = app.get(GraphQLSchemaFactory);
    });

    it("should work", async () => {
        class DemoResolver {
            @Query(() => RootBlockDataScalar(PixelImageBlock))
            image(): void {
                // noop
            }
        }

        const schema = await gqlSchemaFactory.create([DemoResolver]);
        expect(schema.getType("PixelImageBlockData")).toBeTruthy();
    });

    it("should work with multiple instances of the same scalar", async () => {
        class DemoResolver {
            @Query(() => RootBlockDataScalar(PixelImageBlock))
            image1(): void {
                // noop
            }

            @Query(() => RootBlockDataScalar(PixelImageBlock))
            image2(): void {
                // noop
            }
        }

        const schema = await gqlSchemaFactory.create([DemoResolver]);
        expect(schema.getType("PixelImageBlockData")).toBeTruthy();
    });
});
