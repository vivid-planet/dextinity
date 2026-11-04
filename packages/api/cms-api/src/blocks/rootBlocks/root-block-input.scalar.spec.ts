import { NestFactory } from "@nestjs/core";
import { Args, GraphQLSchemaBuilderModule, GraphQLSchemaFactory, Mutation, Query } from "@nestjs/graphql";
import { beforeEach, describe, expect, it } from "vitest";

import { PixelImageBlock } from "../../dam/blocks/pixel-image.block";
import { RootBlockDataScalar } from "./root-block-data.scalar";
import { RootBlockInputScalar } from "./root-block-input.scalar";

let gqlSchemaFactory: GraphQLSchemaFactory;

describe("RootBlockInputScalar", () => {
    beforeEach(async () => {
        const app = await NestFactory.create(GraphQLSchemaBuilderModule, { logger: false });
        await app.init();

        gqlSchemaFactory = app.get(GraphQLSchemaFactory);
    });

    it("should work", async () => {
        class DemoResolver {
            @Query(() => RootBlockDataScalar(PixelImageBlock))
            image(): void {
                // A query is needed for schema generation to work
            }

            @Mutation(() => Boolean)
            createImage(@Args({ name: "image", type: () => RootBlockInputScalar(PixelImageBlock) }) image: unknown): void {
                // noop
            }
        }

        const schema = await gqlSchemaFactory.create([DemoResolver]);
        expect(schema.getType("PixelImageBlockInput")).toBeTruthy();
    });

    it("should work with multiple instances of the same scalar", async () => {
        class DemoResolver {
            @Query(() => RootBlockDataScalar(PixelImageBlock))
            image(): void {
                // A query is needed for schema generation to work
            }

            @Mutation(() => Boolean)
            createImage1(@Args({ name: "image", type: () => RootBlockInputScalar(PixelImageBlock) }) image: unknown): void {
                // noop
            }

            @Mutation(() => Boolean)
            createImage2(@Args({ name: "image", type: () => RootBlockInputScalar(PixelImageBlock) }) image: unknown): void {
                // noop
            }
        }

        const schema = await gqlSchemaFactory.create([DemoResolver]);
        expect(schema.getType("PixelImageBlockInput")).toBeTruthy();
    });
});
