import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ActionLogsUser {
    @Field(() => ID)
    id: string;

    @Field({ nullable: true })
    name?: string;
}
