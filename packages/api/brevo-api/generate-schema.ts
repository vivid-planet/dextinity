import { Embeddable } from "@mikro-orm/decorators/legacy";
import { CombinedPermission, createOneOfBlock, createRichTextBlock, ExternalLinkBlock, registerAdditionalPermissions } from "@dextinity/cms-api";
import { NestFactory } from "@nestjs/core";
import { Field, GraphQLSchemaBuilderModule, GraphQLSchemaFactory, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";

import { createBrevoConfigResolver } from "./lib/brevo-config/brevo-config.resolver.js";
import { BrevoConfigEntityFactory } from "./lib/brevo-config/entities/brevo-config-entity.factory.js";
import { createBrevoContactResolver } from "./lib/brevo-contact/brevo-contact.resolver.js";
import { createBrevoContactImportResolver } from "./lib/brevo-contact/brevo-contact-import.resolver.js";
import { BrevoContactFactory } from "./lib/brevo-contact/dto/brevo-contact.factory.js";
import { BrevoContactInputFactory } from "./lib/brevo-contact/dto/brevo-contact-input.factory.js";
import { BrevoTestContactInputFactory } from "./lib/brevo-contact/dto/brevo-test-contact-input.factory.js";
import { SubscribeInputFactory } from "./lib/brevo-contact/dto/subscribe-input.factory.js";
import { EmailCampaignInputFactory } from "./lib/email-campaign/dto/email-campaign-input.factory.js";
import { createEmailCampaignsResolver } from "./lib/email-campaign/email-campaign.resolver.js";
import { createEmailCampaignEntity } from "./lib/email-campaign/entities/email-campaign-entity.factory.js";
import { TargetGroupInputFactory } from "./lib/target-group/dto/target-group-input.factory.js";
import { createTargetGroupEntity } from "./lib/target-group/entity/target-group-entity.factory.js";
import { createTargetGroupsResolver } from "./lib/target-group/target-group.resolver.js";
import type { BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "./lib/types.js";
import { BrevoPermission } from "./lib/index.js";

@ObjectType("EmailCampaignContentScope")
@InputType("EmailCampaignContentScopeInput")
class EmailCampaignScope implements EmailCampaignScopeInterface {
    [key: string]: unknown;
    // empty scope
    @Field({ nullable: true })
    thisScopeHasNoFields____?: string; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}

@Embeddable()
@ObjectType()
@InputType("BrevoContactFilterAttributesInput")
export class BrevoContactFilterAttributes implements BrevoContactFilterAttributesInterface {
    // index signature to match Array<any> | undefined in BrevoContactFilterAttributesInterface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Array<any> | undefined;

    @Field(() => [String], { nullable: true })
    thisFilterHasNoFields____?: string[]; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}

async function generateSchema(): Promise<void> {
    console.info("Generating schema.gql...");
    const app = await NestFactory.create(GraphQLSchemaBuilderModule);
    await app.init();

    const LinkBlock = createOneOfBlock(
        {
            supportedBlocks: { external: ExternalLinkBlock },
            allowEmpty: false,
        },
        "Link",
    );

    const EmailCampaignContentBlock = createOneOfBlock(
        { supportedBlocks: { internal: createRichTextBlock({ link: LinkBlock }) }, allowEmpty: true },
        "EmailCampaignContent",
    );

    registerAdditionalPermissions(BrevoPermission);

    registerEnumType(CombinedPermission, { name: "Permission" });

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory);

    const BrevoContact = BrevoContactFactory.create({});
    const [BrevoContactInput, BrevoContactUpdateInput] = BrevoContactInputFactory.create({ Scope: EmailCampaignScope });
    const [BrevoTestContactInput] = BrevoTestContactInputFactory.create({ Scope: EmailCampaignScope });

    const BrevoContactSubscribeInput = SubscribeInputFactory.create({ Scope: EmailCampaignScope });
    const BrevoContactResolver = createBrevoContactResolver({
        BrevoContact,
        BrevoContactSubscribeInput,
        Scope: EmailCampaignScope,
        BrevoContactInput,
        BrevoContactUpdateInput,
        BrevoTestContactInput,
    });
    const BrevoContactImportResolver = createBrevoContactImportResolver({
        BrevoContact,
        Scope: EmailCampaignScope,
    });

    const BrevoTargetGroup = createTargetGroupEntity({ Scope: EmailCampaignScope });
    const [TargetGroupInput, TargetGroupUpdateInput] = TargetGroupInputFactory.create({ BrevoFilterAttributes: BrevoContactFilterAttributes });
    const TargetGroupResolver = createTargetGroupsResolver({
        BrevoTargetGroup,
        TargetGroupInput,
        TargetGroupUpdateInput,
        Scope: EmailCampaignScope,
    });

    const BrevoEmailCampaign = createEmailCampaignEntity({ Scope: EmailCampaignScope, TargetGroup: BrevoTargetGroup, EmailCampaignContentBlock });
    const [EmailCampaignInput, EmailCampaignUpdateInput] = EmailCampaignInputFactory.create({ EmailCampaignContentBlock });
    const EmailCampaignResolver = createEmailCampaignsResolver({
        BrevoEmailCampaign,
        BrevoTargetGroup,
        EmailCampaignInput,
        EmailCampaignUpdateInput,
        Scope: EmailCampaignScope,
    });

    const BrevoConfig = BrevoConfigEntityFactory.create({ Scope: EmailCampaignScope });
    const BrevoConfigResolver = createBrevoConfigResolver({
        BrevoConfig,
        Scope: EmailCampaignScope,
    });

    const schema = await gqlSchemaFactory.create([
        BrevoContactResolver,
        TargetGroupResolver,
        EmailCampaignResolver,
        BrevoContactImportResolver,
        BrevoConfigResolver,
    ]);
    await writeFile("schema.gql", printSchema(schema));

    console.log("Done!");
}

generateSchema();
