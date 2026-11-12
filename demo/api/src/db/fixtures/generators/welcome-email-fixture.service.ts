import { FocalPoint } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker.js";
import { MailButtonAlignment, MailButtonVariant } from "@src/mail/blocks/mail-button.block.js";
import { MailImageAspectRatio } from "@src/mail/blocks/mail-image.block.js";
import { MailSpacing } from "@src/mail/blocks/mail-spacer.block.js";
import { WelcomeEmailContentBlock } from "@src/welcome-email/blocks/welcome-email-content.block.js";
import { WelcomeEmail } from "@src/welcome-email/entities/welcome-email.entity.js";

import { PixelImageBlockFixtureService } from "./blocks/media/pixel-image-block-fixture.service.js";

interface WelcomeEmailScope {
    domain: string;
    language: string;
}

type TipTapInlineContent = Array<{ type: "text"; text: string; marks?: object[] }>;

function textBlock(content: string | TipTapInlineContent, textBlockStyle?: "title" | "header" | "small") {
    return {
        type: "textBlock",
        attrs: { textBlock: "paragraph", ...(textBlockStyle ? { textBlockStyle } : {}) },
        content: typeof content === "string" ? [{ type: "text", text: content }] : content,
    };
}

function bulletList(items: string[]) {
    return { type: "bulletList", content: items.map((item) => ({ type: "listItem", content: [textBlock(item)] })) };
}

function tipTapText(...content: object[]) {
    return { tipTapContent: { type: "doc", content } };
}

const phoneLink = {
    type: "link",
    attrs: { data: { attachedBlocks: [{ type: "phone", props: { phone: "+431234567" } }], activeType: "phone" } },
};

const faqLink = {
    type: "link",
    attrs: {
        data: {
            attachedBlocks: [{ type: "external", props: { targetUrl: "https://example.com/faq", openInNewWindow: true, noFollow: false } }],
            activeType: "external",
        },
    },
};

const helpWithTipTap = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph", textBlockStyle: "header" },
                content: [{ type: "text", text: "Where to get help" }],
            },
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [
                    {
                        type: "text",
                        text: "Our team is happy to answer your questions. ",
                    },
                    { type: "text", marks: [phoneLink], text: "Call us" },
                    { type: "text", text: " if anything is unclear." },
                ],
            },
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "textBlock",
                                attrs: { textBlock: "paragraph" },
                                content: [{ type: "text", text: "Text block styles replace heading levels" }],
                            },
                        ],
                    },
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "textBlock",
                                attrs: { textBlock: "paragraph" },
                                content: [{ type: "text", text: "Lists render as a table, so their indent holds in Outlook" }],
                            },
                        ],
                    },
                ],
            },
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph", textBlockStyle: "small" },
                content: [{ type: "text", text: "We answer calls on weekdays from 9 am to 5 pm." }],
            },
        ],
    },
};

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
                        type: "tipTapText",
                        props: tipTapText(textBlock("Welcome to our newsletter", "title")),
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "image",
                        props: { image, fullWidth: true, aspectRatio: MailImageAspectRatio["16x9"] },
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.small } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "tipTapText",
                        props: tipTapText(
                            textBlock("Hi there, and thanks for subscribing — we're glad to have you on board."),
                            textBlock("You'll be the first to hear about:"),
                            bulletList(["Product updates", "Handy tips from our team", "Stories from behind the scenes"]),
                        ),
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.large } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "tipTapText",
                        props: tipTapText(
                            textBlock("Further information", "header"),
                            textBlock([
                                { type: "text", text: "Call our " },
                                { type: "text", marks: [phoneLink], text: "support hotline" },
                                { type: "text", text: " for help or check the " },
                                { type: "text", marks: [faqLink], text: "FAQ" },
                                { type: "text", text: "." },
                            ]),
                        ),
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
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "twoColumns",
                        props: {
                            layout: "1-1",
                            columns: [
                                {
                                    key: faker.string.uuid(),
                                    visible: true,
                                    props: { blocks: [{ key: faker.string.uuid(), visible: true, type: "image", props: image }] },
                                },
                                {
                                    key: faker.string.uuid(),
                                    visible: true,
                                    props: {
                                        blocks: [
                                            {
                                                key: faker.string.uuid(),
                                                visible: true,
                                                type: "text",
                                                props: tipTapText(
                                                    textBlock("Our team", "header"),
                                                    textBlock("Meet the people who write this newsletter."),
                                                ),
                                            },
                                            { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.small } },
                                            {
                                                key: faker.string.uuid(),
                                                visible: true,
                                                type: "button",
                                                props: {
                                                    text: "About us",
                                                    link: { targetUrl: "https://example.com/about", openInNewWindow: true, noFollow: false },
                                                    variant: MailButtonVariant.outlined,
                                                    align: MailButtonAlignment.left,
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                    { key: faker.string.uuid(), visible: true, type: "tipTapText", props: helpWithTipTap },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                    { key: faker.string.uuid(), visible: true, type: "divider", props: {} },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.small } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "tipTapText",
                        props: tipTapText(
                            textBlock("You receive this email because you subscribed to our newsletter."),
                            textBlock("Example Company, Example Street 1, 1010 Vienna"),
                        ),
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                ],
            }).transformToBlockData(),
        });

        this.entityManager.persist(welcomeEmail);
    }
}
