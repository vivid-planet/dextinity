import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BrevoApiCampaignStatistics {
    @Field(() => Int, { nullable: true, description: "Number of unique clicks for the campaign" })
    uniqueClicks: number | null;

    @Field(() => Int, { nullable: true, description: "Number of total clicks for the campaign" })
    clickers: number | null;

    @Field(() => Int, { nullable: true, description: "Number of complaints (Spam reports) for the campaign" })
    complaints: number | null;

    @Field(() => Int, { nullable: true, description: "Number of delivered emails for the campaign" })
    delivered: number | null;

    @Field(() => Int, { nullable: true, description: "Number of sent emails for the campaign" })
    sent: number | null;

    @Field(() => Int, { nullable: true, description: "Number of softbounce for the campaign" })
    softBounces: number | null;

    @Field(() => Int, { nullable: true, description: "Number of hardbounces for the campaign" })
    hardBounces: number | null;

    @Field(() => Int, { nullable: true, description: "Number of unique openings for the campaign" })
    uniqueViews: number | null;

    @Field(() => Int, { nullable: true, description: "Number of unique openings for the campaign" })
    trackableViews: number | null;

    @Field(() => Int, {
        nullable: true,
        description: "Rate of recipients without any privacy protection option enabled in their email client, applied to all delivered emails",
    })
    estimatedViews?: number;

    @Field(() => Int, { nullable: true, description: "Number of unsubscription for the campaign" })
    unsubscriptions: number | null;

    @Field(() => Int, { nullable: true, description: "Number of openings for the campaign" })
    viewed: number | null;
}
