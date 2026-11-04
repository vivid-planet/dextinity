import { Entity } from "@mikro-orm/postgresql";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
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

describe("PageTreeModule", () => {
    describe("forRoot", () => {
        it("accepts a scope decorated with the required GraphQL type names", () => {
            @ObjectType("PageTreeNodeScope")
            @InputType("PageTreeNodeScopeInput")
            class Scope {
                @Field()
                domain: string;
            }

            expect(() => registerPageTreeModule(Scope)).not.toThrow();
        });

        it("throws if the scope's object type isn't named PageTreeNodeScope", () => {
            @ObjectType("WrongScope")
            @InputType("PageTreeNodeScopeInput")
            class Scope {
                @Field()
                domain: string;
            }

            expect(() => registerPageTreeModule(Scope)).toThrow(
                `Invalid object type name for provided page tree scope class. Make sure to decorate the class with @ObjectType("PageTreeNodeScope")`,
            );
        });

        it("throws if the scope's input type isn't named PageTreeNodeScopeInput", () => {
            @ObjectType("PageTreeNodeScope")
            @InputType("WrongScopeInput")
            class Scope {
                @Field()
                domain: string;
            }

            expect(() => registerPageTreeModule(Scope)).toThrow(
                `Invalid input type name for provided page tree scope class. Make sure to decorate the class with @InputType("PageTreeNodeScopeInput")`,
            );
        });

        it("throws if the scope isn't decorated with @InputType at all", () => {
            @ObjectType("PageTreeNodeScope")
            class Scope {
                @Field()
                domain: string;
            }

            expect(() => registerPageTreeModule(Scope)).toThrow(
                `Invalid input type name for provided page tree scope class. Make sure to decorate the class with @InputType("PageTreeNodeScopeInput")`,
            );
        });
    });
});
