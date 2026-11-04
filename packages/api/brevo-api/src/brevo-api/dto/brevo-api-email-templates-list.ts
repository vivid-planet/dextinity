import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BrevoApiEmailTemplateList {
    @Field(() => Int, { nullable: true })
    count?: number;

    @Field(() => Array(BrevoApiEmailTemplate), { nullable: true })
    templates?: Array<BrevoApiEmailTemplate>;
}

@ObjectType()
class BrevoApiEmailTemplateSender {
    @Field(() => String, { nullable: true })
    id?: string;

    @Field(() => String, { nullable: true })
    subject?: string;

    @Field(() => String)
    email: string;
}

@ObjectType()
export class BrevoApiEmailTemplate {
    @Field(() => ID)
    id: number;

    @Field(() => String)
    name: string;

    @Field(() => String)
    subject: string;

    @Field()
    isActive: boolean;

    @Field()
    testSent: boolean;

    @Field(() => String)
    replyTo: string;

    @Field(() => String)
    toField: string;

    @Field(() => String)
    tag: string;

    @Field(() => String)
    htmlContent: string;

    @Field(() => String)
    createdAt: string;

    @Field(() => String)
    modifiedAt: string;

    @Field(() => BrevoApiEmailTemplateSender)
    sender: BrevoApiEmailTemplateSender;
}
