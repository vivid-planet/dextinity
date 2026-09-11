import { V1CronJob } from "@kubernetes/client-node";
import { Injectable } from "@nestjs/common";

import { LABEL_ANNOTATION } from "../kubernetes/kubernetes.constants";
import { getAnnotation } from "../kubernetes/kubernetes-metadata";
import { CronJob } from "./dto/cron-job.object";

@Injectable()
export class CronJobsService {
    convertKubernetesCronJobToCronJobObjectType(cronJob: V1CronJob): CronJob {
        // Props are set if read from kubernetes, so we can safely cast them
        return {
            id: cronJob.metadata?.uid as string,
            name: cronJob.metadata?.name as string,
            label: getAnnotation(cronJob, LABEL_ANNOTATION),
            schedule: cronJob.spec?.schedule as string,
            suspended: cronJob.spec?.suspend as boolean,
            lastScheduledAt: cronJob.status?.lastScheduleTime,
        };
    }
}
