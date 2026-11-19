import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType("KubernetesJobAttempt", { description: "A single attempt (Pod) of a Job. A Job has multiple attempts if it was retried." })
export class JobAttempt {
    @Field()
    podName: string;

    @Field({ nullable: true })
    startedAt?: Date;

    @Field({ nullable: true })
    finishedAt?: Date;

    @Field({
        nullable: true,
        description: "Why the attempt ended, e.g. Completed, Error, OOMKilled or DeadlineExceeded. Not set while the attempt is still running",
    })
    terminationReason?: string;

    @Field(() => Int, { nullable: true })
    exitCode?: number;
}
