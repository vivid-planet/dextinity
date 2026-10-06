import type { V1CronJob } from "@kubernetes/client-node";
import { Inject, Injectable } from "@nestjs/common";

import { INSTANCE_LABEL } from "../kubernetes/kubernetes.constants.js";
import { KubernetesService } from "../kubernetes/kubernetes.service.js";
import type { CurrentUser } from "../user-permissions/dto/current-user.js";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants.js";
import type { AccessControlServiceInterface } from "../user-permissions/user-permissions.types.js";
import { BUILDER_LABEL } from "./builds.constants.js";

@Injectable()
export class BuildTemplatesService {
    constructor(
        private readonly kubernetesService: KubernetesService,
        @Inject(ACCESS_CONTROL_SERVICE) private accessControlService: AccessControlServiceInterface,
    ) {}

    async getAllowedBuilderCronJobs(user: CurrentUser): Promise<V1CronJob[]> {
        const builderCronJobs = await this.getAllBuilderCronJobs();
        return builderCronJobs.filter((cronJob) => {
            return this.accessControlService.isAllowed(user, "builds", this.kubernetesService.getContentScope(cronJob) ?? {});
        });
    }

    async getAllBuilderCronJobs(): Promise<V1CronJob[]> {
        return this.kubernetesService.getAllCronJobs(`${BUILDER_LABEL} = true, ${INSTANCE_LABEL} = ${this.kubernetesService.helmRelease}`);
    }
}
