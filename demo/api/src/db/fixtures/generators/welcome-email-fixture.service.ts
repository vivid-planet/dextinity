import { FocalPoint } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { MailButtonAlignment, MailButtonVariant } from "@src/mail/blocks/mail-button.block";
import { MailSpacing } from "@src/mail/blocks/mail-spacer.block";
import { WelcomeEmailContentBlock } from "@src/welcome-email/blocks/welcome-email-content.block";
import { WelcomeEmail } from "@src/welcome-email/entities/welcome-email.entity";

import { PixelImageBlockFixtureService } from "./blocks/media/pixel-image-block-fixture.service";

interface WelcomeEmailScope {
    domain: string;
    language: string;
}

type MailTextVariant = "title" | "header" | "copy";

interface DraftJsBlock {
    text: string;
    type: MailTextVariant | "unordered-list-item";
    entityRanges?: Array<{ offset: number; length: number; key: number }>;
}

function draftContent<TEntityMap extends object>(blocks: DraftJsBlock[], entityMap: TEntityMap) {
    return {
        blocks: blocks.map(({ text, type, entityRanges = [] }) => ({
            key: faker.string.uuid(),
            text,
            type,
            depth: 0,
            inlineStyleRanges: [],
            entityRanges,
            data: {},
        })),
        entityMap,
    };
}

@Injectable()
export class WelcomeEmailFixtureService {
    private logger = new Logger(WelcomeEmailFixtureService.name);

    constructor(
        private readonly entityManager: EntityManager,
        private readonly pixelImageBlockFixtureService: PixelImageBlockFixtureService,
    ) {}

    async generate(scope: WelcomeEmailScope): Promise<void> {
        this.logger.log("Generating welcome email...");

        const image = await this.pixelImageBlockFixtureService.generateBlockInput({ focalPoint: FocalPoint.SMART });

        const welcomeEmail = this.entityManager.create(WelcomeEmail, {
            scope,
            content: WelcomeEmailContentBlock.blockInputFactory({
                blocks: [
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "text",
                        props: { draftContent: draftContent([{ text: "Welcome to our newsletter", type: "title" }], {}) },
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                    { key: faker.string.uuid(), visible: true, type: "image", props: { image, fullWidth: true } },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.small } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "text",
                        props: {
                            draftContent: draftContent(
                                [
                                    { text: "Hi there, and thanks for subscribing — we're glad to have you on board.", type: "copy" },
                                    { text: "You'll be the first to hear about:", type: "copy" },
                                    { text: "Product updates", type: "unordered-list-item" },
                                    { text: "Handy tips from our team", type: "unordered-list-item" },
                                    { text: "Stories from behind the scenes", type: "unordered-list-item" },
                                ],
                                {},
                            ),
                        },
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.large } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "text",
                        props: {
                            draftContent: draftContent(
                                [
                                    { text: "Further information", type: "header" },
                                    {
                                        text: "Call our support hotline for help or check the FAQ.",
                                        type: "copy",
                                        entityRanges: [
                                            { offset: 9, length: 15, key: 0 },
                                            { offset: 47, length: 3, key: 1 },
                                        ],
                                    },
                                ],
                                {
                                    "0": {
                                        type: "LINK",
                                        mutability: "MUTABLE",
                                        data: { attachedBlocks: [{ type: "phone", props: { phone: "+431234567" } }], activeType: "phone" },
                                    },
                                    "1": {
                                        type: "LINK",
                                        mutability: "MUTABLE",
                                        data: {
                                            attachedBlocks: [
                                                {
                                                    type: "external",
                                                    props: { targetUrl: "https://example.com/faq", openInNewWindow: true, noFollow: false },
                                                },
                                            ],
                                            activeType: "external",
                                        },
                                    },
                                },
                            ),
                        },
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "button",
                        props: {
                            text: "Visit our website",
                            link: { targetUrl: "https://example.com", openInNewWindow: true, noFollow: false },
                            variant: MailButtonVariant.filled,
                            align: MailButtonAlignment.left,
                        },
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                    { key: faker.string.uuid(), visible: true, type: "divider", props: {} },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.small } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "text",
                        props: {
                            draftContent: draftContent(
                                [
                                    {
                                        text: "You receive this email because you subscribed to our newsletter.",
                                        type: "copy",
                                    },
                                    { text: "Example Company, Example Street 1, 1010 Vienna", type: "copy" },
                                ],
                                {},
                            ),
                        },
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                ],
            }).transformToBlockData(),
        });

        this.entityManager.persist(welcomeEmail);
    }
}
