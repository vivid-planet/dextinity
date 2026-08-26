import { V1Job } from "@kubernetes/client-node";
import { Injectable } from "@nestjs/common";
import { format } from "date-fns";

import { LABEL_ANNOTATION } from "../kubernetes/kubernetes.constants";
import { KubernetesService } from "../kubernetes/kubernetes.service";
import { getAnnotation } from "../kubernetes/kubernetes-metadata";
import { Job } from "./dto/job.object";

@Injectable()
export class JobsService {
    constructor(private readonly kubernetesService: KubernetesService) {}

    convertKuberneteJobToJobObjectType(job: V1Job): Job {
        return {
            id: job.metadata?.uid as string,
            name: job.metadata?.name as string,
            label: getAnnotation(job, LABEL_ANNOTATION),
            startTime: job.status?.startTime,
            completionTime: job.status?.completionTime,
            status: this.kubernetesService.getStatusForKubernetesJob(job),
        };
    }

    createJobNameFromCronJobForManualRun(cronJobName: string): string {
        let suffix = `man-${format(new Date(), "yyyy-MM-dd-HH-mm-ss")}`;

        // Kubernetes Job name length must be less than or equal to 63 characters
        const excessLength = cronJobName.length + suffix.length - 62;
        if (excessLength > 0) {
            // shorten suffix to fit the 63 character limit, use last characters because they are more unique
            suffix = suffix.slice(excessLength);
        }

        return `${cronJobName}-${suffix}`;
    }
}
