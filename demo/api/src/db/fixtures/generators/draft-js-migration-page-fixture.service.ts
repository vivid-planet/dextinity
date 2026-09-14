import { PageTreeNodeBaseCreateInput, PageTreeNodeVisibility, PageTreeService } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { PageContentBlock } from "@src/documents/pages/blocks/page-content.block";
import { StageBlock } from "@src/documents/pages/blocks/stage.block";
import { PageInput } from "@src/documents/pages/dto/page.input";
import { Page } from "@src/documents/pages/entities/page.entity";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category";
import { UserGroup } from "@src/user-groups/user-group";

import { generateSeoBlock } from "./blocks/seo.generator";

// Hardcoded legacy DraftJS-shaped content. Exercises the createTipTapRichTextBlock
// `migrateFromDraftJs` migration path: blocks, headings, lists, inline styles, and a LINK entity.
const legacyDraftJsContent = {
    blocks: [
        {
            key: "11111111-1111-1111-1111-111111111111",
            text: "Migrated from DraftJS",
            type: "header-one",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "22222222-2222-2222-2222-222222222222",
            text: "This paragraph has bold and italic text mixed in.",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
                { style: "BOLD", offset: 14, length: 4 },
                { style: "ITALIC", offset: 23, length: 6 },
            ],
            entityRanges: [],
            data: {},
        },
        {
            key: "33333333-3333-3333-3333-333333333333",
            text: "And here is a strikethrough plus a link to Dextinity.",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [{ style: "STRIKETHROUGH", offset: 14, length: 13 }],
            entityRanges: [{ key: 0, offset: 43, length: 9 }],
            data: {},
        },
        {
            key: "33333333-3333-3333-3333-3333333333aa",
            text: "This used a custom paragraph-small block type and should keep its smaller style.",
            type: "paragraph-small",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            // Special characters: U+00A0 (NBSP) between "key" and "value", U+00AD (soft hyphen) inside "extra­ordinary".
            // Also exercises SUB/SUP inline styles (H2O, E=mc2).
            key: "33333333-3333-3333-3333-3333333333bb",
            text: "key value, extra­ordinary stuff like H2O and E=mc2.",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
                { style: "SUB", offset: 38, length: 1 },
                { style: "SUP", offset: 49, length: 1 },
            ],
            entityRanges: [],
            data: {},
        },
        {
            key: "44444444-4444-4444-4444-444444444444",
            text: "First bullet point",
            type: "unordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "55555555-5555-5555-5555-555555555555",
            text: "Nested bullet point",
            type: "unordered-list-item",
            depth: 1,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "55555555-5555-5555-5555-5555555555aa",
            text: "Second bullet point",
            type: "unordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "66666666-6666-6666-6666-666666666666",
            text: "First ordered item",
            type: "ordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "66666666-6666-6666-6666-6666666666aa",
            text: "Nested ordered item",
            type: "ordered-list-item",
            depth: 1,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "77777777-7777-7777-7777-777777777777",
            text: "Second ordered item",
            type: "ordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
    ],
    entityMap: {
        "0": {
            type: "LINK",
            mutability: "MUTABLE",
            data: {
                attachedBlocks: [{ type: "external", props: { targetUrl: "https://dextinity.com", openInNewWindow: true } }],
                activeType: "external",
            },
        },
    },
};

@Injectable()
export class DraftJsMigrationPageFixtureService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
    ) {}

    async execute(): Promise<void> {
        const documentId = "deadbeef-0000-4000-8000-000000000001";
        const scope: PageTreeNodeScope = { domain: "main", language: "en" };

        const node = await this.pageTreeService.createNode(
            {
                name: "DraftJS Migration Demo",
                slug: "draftjs-migration-demo",
                attachedDocument: { id: documentId, type: "Page" },
                userGroup: UserGroup.all,
            } as PageTreeNodeBaseCreateInput,
            PageTreeNodeCategory.mainNavigation,
            scope,
        );
        await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);

        const pageInput = new PageInput();
        pageInput.seo = generateSeoBlock();
        pageInput.stage = StageBlock.blockInputFactory({ blocks: [] });

        await this.entityManager.persistAndFlush(
            this.entityManager.create(Page, {
                id: documentId,
                content: PageContentBlock.blockInputFactory({ blocks: [] }).transformToBlockData(),
                seo: pageInput.seo.transformToBlockData(),
                stage: pageInput.stage.transformToBlockData(),
            }),
        );

        // Bypass the RootBlockType custom column so the legacy DraftJS-shaped JSON lands in the DB
        // unchanged. The on-read DraftJS→TipTap migration in TipTapRichTextBlock.blockDataFactory
        // is what we want this fixture to exercise.
        const legacyPageContent = {
            data: {
                blocks: [
                    {
                        key: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                        visible: true,
                        type: "tipTapRichText",
                        props: { draftContent: legacyDraftJsContent },
                        userGroup: UserGroup.all,
                    },
                ],
            },
            index: [],
        };
        await this.entityManager
            .getConnection()
            .execute(`UPDATE "Page" SET content = ? WHERE id = ?`, [JSON.stringify(legacyPageContent), documentId]);
    }
}
