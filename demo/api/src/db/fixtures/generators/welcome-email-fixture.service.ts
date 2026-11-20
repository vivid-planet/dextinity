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

type MailTextStyle = "title" | "header" | "small";

interface TextNode {
    type: "text";
    text: string;
    marks?: Array<{ type: "link"; attrs: { data: object } }>;
}

function text(value: string): TextNode {
    return { type: "text", text: value };
}

function linkedText(value: string, linkData: object): TextNode {
    return { type: "text", text: value, marks: [{ type: "link", attrs: { data: linkData } }] };
}

function heading(value: string, textBlock: "title" | "header") {
    return { type: "textBlock", attrs: { textBlock }, content: [text(value)] };
}

function paragraph(content: Array<TextNode | string>, textBlockStyle?: MailTextStyle) {
    return {
        type: "textBlock",
        attrs: textBlockStyle ? { textBlock: "paragraph", textBlockStyle } : { textBlock: "paragraph" },
        content: content.map((node) => (typeof node === "string" ? text(node) : node)),
    };
}

function bulletList(items: string[]) {
    return { type: "bulletList", content: items.map((item) => ({ type: "listItem", content: [paragraph([item])] })) };
}

function richText(...content: object[]) {
    return { tipTapContent: { type: "doc", content } };
}

const phoneLinkData = { attachedBlocks: [{ type: "phone", props: { phone: "+431234567" } }], activeType: "phone" };

const faqLinkData = {
    attachedBlocks: [{ type: "external", props: { targetUrl: "https://example.com/faq", openInNewWindow: true, noFollow: false } }],
    activeType: "external",
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
                        type: "heading",
                        props: richText(heading("Welcome to our newsletter", "title")),
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
                        type: "text",
                        props: richText(
                            paragraph(["Hi there, and thanks for subscribing — we're glad to have you on board."]),
                            paragraph(["You'll be the first to hear about:"]),
                            bulletList(["Product updates", "Handy tips from our team", "Stories from behind the scenes"]),
                        ),
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.large } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "text",
                        props: richText(
                            paragraph(["Further information"], "header"),
                            paragraph([
                                "Call our ",
                                linkedText("support hotline", phoneLinkData),
                                " for help or check the ",
                                linkedText("FAQ", faqLinkData),
                                ".",
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
                                                props: richText(
                                                    paragraph(["Our team"], "header"),
                                                    paragraph(["Meet the people who write this newsletter."]),
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
                    { key: faker.string.uuid(), visible: true, type: "divider", props: {} },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.small } },
                    {
                        key: faker.string.uuid(),
                        visible: true,
                        type: "text",
                        props: richText(
                            paragraph(["You receive this email because you subscribed to our newsletter."], "small"),
                            paragraph(["Example Company, Example Street 1, 1010 Vienna"], "small"),
                        ),
                    },
                    { key: faker.string.uuid(), visible: true, type: "spacer", props: { spacing: MailSpacing.medium } },
                ],
            }).transformToBlockData(),
        });

        this.entityManager.persist(welcomeEmail);
    }
}
