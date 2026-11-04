import {
    AnyEntity,
    BaseEntity,
    defineConfig,
    Embeddable,
    Embedded,
    Entity,
    ManyToOne,
    MikroORM,
    PrimaryKey,
    Property,
    Ref,
} from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { EntityScopeServiceInterface } from "./decorators/scoped-entity.decorator";
import { getScopesForScopedEntity } from "./get-scopes-for-scoped-entity";
import { ContentScope } from "./interfaces/content-scope.interface";

@Embeddable()
class ContentScopeEmbeddable {
    @Property()
    domain!: string;

    @Property()
    language!: string;
}

@Entity({ tableName: "Company" })
class Company extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Embedded(() => ContentScopeEmbeddable)
    scope!: ContentScopeEmbeddable;
}

@Entity({ tableName: "News" })
class News extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Embedded(() => ContentScopeEmbeddable)
    scope!: ContentScopeEmbeddable;
}

@Entity({ tableName: "NewsComment" })
class NewsComment extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @ManyToOne(() => News, { ref: true })
    news!: Ref<News>;
}

@Entity({ tableName: "Product" })
class Product extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @ManyToOne(() => Company, { ref: true })
    company!: Ref<Company>;
}

@Injectable()
class NewsCommentScopeService implements EntityScopeServiceInterface<NewsComment> {
    async getEntityScope(): Promise<ContentScope> {
        return { domain: "service-domain", language: "en" };
    }
}

describe("getScopesForScopedEntity", () => {
    let orm: MikroORM;

    beforeAll(async () => {
        orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                allowGlobalContext: true,
                entities: [Company, News, NewsComment, Product, ContentScopeEmbeddable],
            }),
        );
    });

    afterAll(async () => {
        await orm.close();
    });

    const serviceModuleRef = { get: () => new NewsCommentScopeService() } as unknown as ModuleRef;
    const unusedModuleRef = {
        get: () => {
            throw new Error("ModuleRef should not be used");
        },
    } as unknown as ModuleRef;

    describe("callback variant", () => {
        it("invokes a synchronous callback with the row", async () => {
            const row = orm.em.create(NewsComment, { id: "1", news: { id: "n1", scope: { domain: "main", language: "en" } } });

            const scope = await getScopesForScopedEntity({
                scoped: (newsComment: AnyEntity) => ({ commentId: newsComment.id }),
                entity: NewsComment,
                row,
                entityManager: orm.em,
                moduleRef: unusedModuleRef,
            });

            expect(scope).toEqual({ commentId: "1" });
        });

        it("awaits an asynchronous callback", async () => {
            const row = orm.em.create(NewsComment, { id: "2", news: { id: "n2", scope: { domain: "main", language: "en" } } });

            const scope = await getScopesForScopedEntity({
                scoped: async () => ({ domain: "async-domain" }),
                entity: NewsComment,
                row,
                entityManager: orm.em,
                moduleRef: unusedModuleRef,
            });

            expect(scope).toEqual({ domain: "async-domain" });
        });

        it("supports a callback returning multiple scopes", async () => {
            const row = orm.em.create(NewsComment, { id: "3", news: { id: "n3", scope: { domain: "main", language: "en" } } });

            const scope = await getScopesForScopedEntity({
                scoped: () => [{ domain: "a" }, { domain: "b" }],
                entity: NewsComment,
                row,
                entityManager: orm.em,
                moduleRef: unusedModuleRef,
            });

            expect(scope).toEqual([{ domain: "a" }, { domain: "b" }]);
        });
    });

    describe("injectable service variant", () => {
        it("resolves the service via ModuleRef and calls getEntityScope", async () => {
            const row = orm.em.create(NewsComment, { id: "4", news: { id: "n4", scope: { domain: "main", language: "en" } } });

            const scope = await getScopesForScopedEntity({
                scoped: NewsCommentScopeService,
                entity: NewsComment,
                row,
                entityManager: orm.em,
                moduleRef: serviceModuleRef,
            });

            expect(scope).toEqual({ domain: "service-domain", language: "en" });
        });
    });

    describe("string mapping variant", () => {
        it("resolves a relation followed by an embeddable scope", async () => {
            const row = orm.em.create(NewsComment, { id: "5", news: { id: "n5", scope: { domain: "main", language: "de" } } });

            const scope = await getScopesForScopedEntity({
                scoped: "news.scope",
                entity: NewsComment,
                row,
                entityManager: orm.em,
                moduleRef: unusedModuleRef,
            });

            expect(scope).toEqual({ domain: "main", language: "de" });
        });
    });

    describe("multiple mappings variant", () => {
        it("resolves an array of mappings into an array of scopes", async () => {
            const row = orm.em.create(NewsComment, { id: "8", news: { id: "n8", scope: { domain: "main", language: "de" } } });

            const scope = await getScopesForScopedEntity({
                scoped: ["news.scope", { newsId: "news.id" }],
                entity: NewsComment,
                row,
                entityManager: orm.em,
                moduleRef: unusedModuleRef,
            });

            expect(scope).toEqual([{ domain: "main", language: "de" }, { newsId: "n8" }]);
        });
    });

    describe("object mapping variant", () => {
        it("resolves each field path into a scope object", async () => {
            const row = orm.em.create(Product, { id: "6", company: { id: "c1", scope: { domain: "main", language: "en" } } });

            const scope = await getScopesForScopedEntity({
                scoped: { companyId: "company.id" },
                entity: Product,
                row,
                entityManager: orm.em,
                moduleRef: unusedModuleRef,
            });

            expect(scope).toEqual({ companyId: "c1" });
        });
    });

    describe("invalid mapping", () => {
        it("throws for an unknown field path", async () => {
            const row = orm.em.create(NewsComment, { id: "7", news: { id: "n7", scope: { domain: "main", language: "en" } } });

            await expect(
                getScopesForScopedEntity({
                    scoped: "nonExistent.scope",
                    entity: NewsComment,
                    row,
                    entityManager: orm.em,
                    moduleRef: unusedModuleRef,
                }),
            ).rejects.toThrow('Field "nonExistent" not found in entity "NewsComment"');
        });
    });
});
