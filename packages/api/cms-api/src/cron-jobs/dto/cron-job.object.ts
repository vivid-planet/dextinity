import { Field, ID, ObjectType } from "@nestjs/graphql";

import { LABEL_ANNOTATION } from "../../kubernetes/kubernetes.constants";
import { toLegacyName } from "../../kubernetes/kubernetes-metadata";

@ObjectType("KubernetesCronJob")
export class CronJob {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({
        nullable: true,
        description: `Human readable label provided by ${LABEL_ANNOTATION} (or the legacy ${toLegacyName(LABEL_ANNOTATION)}) annotation. Use name as fallback if not present`,
    })
    label?: string;

    @Field()
    schedule: string;

    @Field()
    suspended: boolean;

    @Field({ nullable: true })
    lastScheduledAt?: Date;
}
