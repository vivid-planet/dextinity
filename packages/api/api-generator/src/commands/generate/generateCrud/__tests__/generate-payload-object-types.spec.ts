import { describe, expect, it } from "vitest";

import { generatePayloadObjectTypes } from "../generate-payload-object-types";

describe("generatePayloadObjectTypes", () => {
    it("should return empty string when hooksService is null", () => {
        const result = generatePayloadObjectTypes({
            hooksService: null,
            instanceNameSingular: "product",
            entityName: "Product",
        });
        expect(result.code).toBe("");
        expect(result.createPayloadType).toBeNull();
        expect(result.updatePayloadType).toBeNull();
    });

    it("should return empty string when hooksService has no validate methods", () => {
        const result = generatePayloadObjectTypes({
            hooksService: {
                className: "ProductService",
                imports: [],
                validateCreateInput: null,
                validateUpdateInput: null,
            },
            instanceNameSingular: "product",
            entityName: "Product",
        });
        expect(result.code).toBe("");
        expect(result.createPayloadType).toBeNull();
        expect(result.updatePayloadType).toBeNull();
    });

    it("should generate payload type for validateCreateInput with returnType", () => {
        const result = generatePayloadObjectTypes({
            hooksService: {
                className: "ProductService",
                imports: [],
                validateCreateInput: { returnType: "ProductMutationError" },
                validateUpdateInput: null,
            },
            instanceNameSingular: "product",
            entityName: "Product",
        });
        expect(result.code).toContain("@ObjectType()");
        expect(result.code).toContain("class CreateProductPayload");
        expect(result.code).toContain("@Field(() => Product, { nullable: true })");
        expect(result.code).toContain("product?: Product");
        expect(result.code).toContain("@Field(() => [ProductMutationError], { nullable: false })");
        expect(result.code).toContain("errors: ProductMutationError[]");
        expect(result.createPayloadType).toBe("CreateProductPayload");
        expect(result.updatePayloadType).toBeNull();
    });

    it("should generate payload type for validateUpdateInput with returnType", () => {
        const result = generatePayloadObjectTypes({
            hooksService: {
                className: "ProductService",
                imports: [],
                validateCreateInput: null,
                validateUpdateInput: { returnType: "ProductMutationError" },
            },
            instanceNameSingular: "product",
            entityName: "Product",
        });
        expect(result.code).toContain("class UpdateProductPayload");
        expect(result.code).toContain("product?: Product");
        expect(result.code).toContain("errors: ProductMutationError[]");
        expect(result.createPayloadType).toBeNull();
        expect(result.updatePayloadType).toBe("UpdateProductPayload");
    });

    it("should generate payload types for both validate methods", () => {
        const result = generatePayloadObjectTypes({
            hooksService: {
                className: "ProductService",
                imports: [],
                validateCreateInput: { returnType: "CreateError" },
                validateUpdateInput: { returnType: "UpdateError" },
            },
            instanceNameSingular: "product",
            entityName: "Product",
        });
        expect(result.code).toContain("errors: CreateError[]");
        expect(result.code).toContain("errors: UpdateError[]");
        expect(result.createPayloadType).toBe("CreateProductPayload");
        expect(result.updatePayloadType).toBe("UpdateProductPayload");
    });
});
