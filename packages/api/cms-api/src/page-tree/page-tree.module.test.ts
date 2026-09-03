import { Entity } from "@mikro-orm/postgresql";
import { Field, ObjectType, TypeMetadataStorage } from "@nestjs/graphql";
import { describe, expect, it } from "vitest";

import { DocumentInterface } from "../document/dto/document-interface";
import { PageTreeNodeBase } from "./entities/page-tree-node-base.entity";
import { PageTreeModule } from "./page-tree.module";

@Entity()
@ObjectType()
class PageTreeNode extends PageTreeNodeBase {}

@ObjectType({ implements: () => [DocumentInterface] })
class Page implements DocumentInterface {
    id: string;
    updatedAt: Date;
}

function registerPageTreeModule(Scope?: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return PageTreeModule.forRoot({ PageTreeNode, Documents: [Page], Scope: Scope as any, sitePreviewSecret: "secret" });
}

// @InputType() only queues its metadata for the schema builder to pick up once a GraphQL schema is actually built, so it
// isn't visible via TypeMetadataStorage.getInputTypeMetadataByTarget() otherwise. Registering it directly keeps these
// tests synchronous and independent of whether a schema gets built.
function createScope(objectTypeName: string, inputTypeName: string) {
    @ObjectType(objectTypeName)
    class Scope {
        @Field()
        domain: string;
    }

    TypeMetadataStorage.addInputTypeMetadata({ target: Scope, name: inputTypeName });

    return Scope;
}

describe("PageTreeModule", () => {
    describe("forRoot", () => {
        it("accepts a scope decorated with the required GraphQL type names", () => {
            const ValidScope = createScope("PageTreeNodeScope", "PageTreeNodeScopeInput");

            expect(() => registerPageTreeModule(ValidScope)).not.toThrow();
        });

        it("throws if the scope's object type isn't named PageTreeNodeScope", () => {
            const InvalidScope = createScope("WrongScope", "PageTreeNodeScopeInput");

            expect(() => registerPageTreeModule(InvalidScope)).toThrow(
                `Invalid object type name for provided page tree scope class. Make sure to decorate the class with @ObjectType("PageTreeNodeScope")`,
            );
        });

        it("throws if the scope's input type isn't named PageTreeNodeScopeInput", () => {
            const InvalidScope = createScope("PageTreeNodeScope", "WrongScopeInput");

            expect(() => registerPageTreeModule(InvalidScope)).toThrow(
                `Invalid input type name for provided page tree scope class. Make sure to decorate the class with @InputType("PageTreeNodeScopeInput")`,
            );
        });
    });
});
