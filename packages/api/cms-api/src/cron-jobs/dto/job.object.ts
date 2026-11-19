import { Field, ID, ObjectType } from "@nestjs/graphql";

import { KubernetesJobStatus } from "../../kubernetes/job-status.enum";
import { LABEL_ANNOTATION } from "../../kubernetes/kubernetes.constants";
import { toLegacyName } from "../../kubernetes/kubernetes-metadata";
import { JobAttempt } from "./job-attempt.object";

@ObjectType("KubernetesJob")
export class Job {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({
        nullable: true,
        description: `Human readable label provided by ${LABEL_ANNOTATION} (or the legacy ${toLegacyName(LABEL_ANNOTATION)}) annotation. Use name as fallback if not present`,
    })
    label?: string;

    @Field(() => KubernetesJobStatus)
    status: KubernetesJobStatus;

    @Field({ nullable: true })
    startTime?: Date;

    @Field({ nullable: true })
    completionTime?: Date;

    /** Resolved by `JobsResolver.attempts` if not already set */
    attempts?: JobAttempt[];

    @Field({ nullable: true, description: "Reason of the Job's Failed condition, e.g. BackoffLimitExceeded or DeadlineExceeded" })
    failureReason?: string;

    @Field({ nullable: true, description: "Message of the Job's Failed condition" })
    failureMessage?: string;
}
