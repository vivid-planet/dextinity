import { Inject, UseGuards } from "@nestjs/common";
import { Args, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { GetCurrentUser } from "../auth/decorators/get-current-user.decorator";
import { KubernetesService } from "../kubernetes/kubernetes.service";
import { KubernetesAuthenticationGuard } from "../kubernetes/kubernetes-authentication.guard";
import { getJobAttempts } from "../kubernetes/kubernetes-job-attempts";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../user-permissions/dto/current-user";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants";
import { AccessControlServiceInterface } from "../user-permissions/user-permissions.types";
import { Job } from "./dto/job.object";
import { JobAttempt } from "./dto/job-attempt.object";
import { JobsService } from "./jobs.service";

@Resolver(() => Job)
@RequiredPermission(["cronJobs"], { skipScopeCheck: true })
@UseGuards(KubernetesAuthenticationGuard)
export class JobsResolver {
    constructor(
        private readonly kubernetesService: KubernetesService,
        private readonly jobsService: JobsService,
        @Inject(ACCESS_CONTROL_SERVICE) private accessControlService: AccessControlServiceInterface,
    ) {}

    @Query(() => [Job])
    async kubernetesJobs(@Args("cronJobName") cronJobName: string, @GetCurrentUser() user: CurrentUser): Promise<Job[]> {
        const cronJob = await this.kubernetesService.getCronJob(cronJobName);
        const contentScope = this.kubernetesService.getContentScope(cronJob);
        if (contentScope && !this.accessControlService.isAllowed(user, "cronJobs", contentScope)) {
            throw new Error("Access denied");
        }

        const jobs = await this.kubernetesService.getAllJobsForCronJob(cronJobName);
        const podsByJobName = await this.kubernetesService.getPodsForJobs(jobs);
        return jobs.map((job) => this.jobsService.convertKuberneteJobToJobObjectType(job, podsByJobName.get(job.metadata?.name ?? "") ?? []));
    }

    @Query(() => Job)
    async kubernetesJob(@Args("name") jobName: string, @GetCurrentUser() user: CurrentUser): Promise<Job> {
        const job = await this.kubernetesService.getJob(jobName);
        const contentScope = this.kubernetesService.getContentScope(job);
        if (contentScope && !this.accessControlService.isAllowed(user, "cronJobs", contentScope)) {
            throw new Error("Access denied");
        }

        return this.jobsService.convertKuberneteJobToJobObjectType(job);
    }

    @Query(() => String)
    async kubernetesJobLogs(@Args("name") jobName: string, @GetCurrentUser() user: CurrentUser): Promise<string> {
        const job = await this.kubernetesService.getJob(jobName);
        const contentScope = this.kubernetesService.getContentScope(job);
        if (contentScope && !this.accessControlService.isAllowed(user, "cronJobs", contentScope)) {
            throw new Error("Access denied");
        }

        return this.kubernetesService.getJobLogs(job);
    }

    @ResolveField(() => [JobAttempt], {
        description: "Attempts (Pods) of the Job sorted by creation time. More than one attempt means the Job was retried",
    })
    async attempts(@Parent() job: Job): Promise<JobAttempt[]> {
        if (job.attempts) {
            return job.attempts;
        }

        const pods = await this.kubernetesService.getPodsForJob({ metadata: { name: job.name } });
        return getJobAttempts(pods);
    }
}
