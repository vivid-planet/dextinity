import { V1CronJob, V1Job } from "@kubernetes/client-node";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable, Logger } from "@nestjs/common";
import parser from "cron-parser";
import { format } from "date-fns";

import { KubernetesJobStatus } from "../kubernetes/job-status.enum";
import { INSTANCE_LABEL, LABEL_ANNOTATION, PARENT_CRON_JOB_LABEL } from "../kubernetes/kubernetes.constants";
import { KubernetesService } from "../kubernetes/kubernetes.service";
import { getAnnotation, getLabel } from "../kubernetes/kubernetes-metadata";
import { CurrentUser } from "../user-permissions/dto/current-user";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants";
import { AccessControlServiceInterface } from "../user-permissions/user-permissions.types";
import { BuildTemplatesService } from "./build-templates.service";
import { BUILDER_LABEL, TRIGGER_ANNOTATION } from "./builds.constants";
import { AutoBuildStatus } from "./dto/auto-build-status.object";
import { Build } from "./dto/build.object";
import { ChangesSinceLastBuild } from "./entities/changes-since-last-build.entity";

const JOB_HISTORY_LIMIT = 20;

@Injectable()
export class BuildsService {
    private readonly logger = new Logger(BuildsService.name);

    constructor(
        @InjectRepository(ChangesSinceLastBuild) private readonly changesRepository: EntityRepository<ChangesSinceLastBuild>,
        private readonly buildTemplatesService: BuildTemplatesService,
        private readonly kubernetesService: KubernetesService,
        @Inject(ACCESS_CONTROL_SERVICE) private accessControlService: AccessControlServiceInterface,
        private readonly entityManager: EntityManager,
    ) {}

    private async getAllowedBuildJobs(user: CurrentUser): Promise<V1Job[]> {
        const allJobs = await this.kubernetesService.getAllJobs(`${BUILDER_LABEL} = true, ${INSTANCE_LABEL} = ${this.kubernetesService.helmRelease}`);
        return allJobs.filter((job) => {
            return this.accessControlService.isAllowed(user, "builds", this.kubernetesService.getContentScope(job) ?? {});
        });
    }

    async createBuilds(trigger: string, builderCronJobs: V1CronJob[]): Promise<boolean> {
        // No ACL here, because this is only used for clean-up
        const builderJobs = await this.kubernetesService.getAllJobs(
            `${BUILDER_LABEL} = true, ${INSTANCE_LABEL} = ${this.kubernetesService.helmRelease}`,
        );
        if (builderJobs.length > JOB_HISTORY_LIMIT - builderCronJobs.length) {
            // Deletes all jobs except JOB_HISTORY_LIMIT most recent
            // This cleans Kubernetes as manually created jobs are not garbage collected by the CronJobController
            for (const job of builderJobs.slice(JOB_HISTORY_LIMIT)) {
                const name = job.metadata?.name;
                if (!name) {
                    throw new Error(`Error deleting namespaced job: No name returned`);
                }

                await this.kubernetesService.deleteJob(name);
            }
        }

        for (const cronJob of builderCronJobs) {
            const jobs = await this.kubernetesService.getAllJobs(`${PARENT_CRON_JOB_LABEL} = ${cronJob.metadata?.name}`);
            const mostRecentJob = jobs.shift();
            if (mostRecentJob) {
                // check if another build is already running and skip if so, to prevent overwhelming the cluster
                const status = this.kubernetesService.getStatusForKubernetesJob(mostRecentJob);
                if (status === KubernetesJobStatus.active || status === KubernetesJobStatus.pending) {
                    console.warn(`Job for ${cronJob.metadata?.name} already running; skipping this run`);
                    continue;
                }
            }

            await this.kubernetesService.createJobFromCronJob(cronJob, {
                name: `${cronJob.metadata?.name}-${format(new Date(), "yyyy-MM-dd-HH-mm-ss")}`,
                annotations: { [TRIGGER_ANNOTATION]: trigger },
            });
        }

        return true;
    }

    /**
     * Should only be used internally
     */
    async createBuildsForAllScopes(trigger: string): Promise<boolean> {
        const builderCronJobs = await this.kubernetesService.getAllCronJobs(
            `${BUILDER_LABEL} = true, ${INSTANCE_LABEL} = ${this.kubernetesService.helmRelease}`,
        );
        return this.createBuilds(trigger, builderCronJobs);
    }

    async getBuilds(user: CurrentUser, options?: { limit?: number | undefined }): Promise<Build[]> {
        const buildJobs = await this.getAllowedBuildJobs(user);
        return Promise.all(
            buildJobs.slice(0, options?.limit).map(async (job) => {
                return {
                    id: job.metadata?.uid as string, // uid can be null if the object is used for creating a Job, but not for reading
                    name: job.metadata?.name,
                    status: this.kubernetesService.getStatusForKubernetesJob(job),
                    startTime: job.status?.startTime,
                    completionTime: job.status?.completionTime,
                    estimatedCompletionTime: await this.kubernetesService.estimateJobCompletionTime(
                        job,
                        `${PARENT_CRON_JOB_LABEL} = ${getLabel(job, PARENT_CRON_JOB_LABEL)}`,
                    ),
                    trigger: getAnnotation(job, TRIGGER_ANNOTATION),
                    label: getAnnotation(job, LABEL_ANNOTATION),
                };
            }),
        );
    }

    async getAutoBuildStatus(user: CurrentUser): Promise<AutoBuildStatus> {
        const autoBuildStatus = new AutoBuildStatus();
        autoBuildStatus.hasChangesSinceLastBuild = await this.hasChangesSinceLastBuild();

        const cronJobs = await this.buildTemplatesService.getAllowedBuilderCronJobs(user);
        const cronJob = cronJobs?.[0];
        if (!cronJob) {
            throw new Error("BuildChecker CronJob not found.");
        }
        autoBuildStatus.lastCheck = cronJob.status?.lastScheduleTime;

        const interval = parser.parseExpression(cronJob.spec?.schedule as string);
        autoBuildStatus.nextCheck = interval.next().toDate();

        return autoBuildStatus;
    }

    async setChangesSinceLastBuild(scope: ContentScope | "all" = "all"): Promise<void> {
        const isEmptyScope = scope !== "all" && Object.keys(scope).length === 0; // Caused by features with optional scoping, e.g. redirects

        if (isEmptyScope) {
            scope = "all";
        }

        if ((await this.changesRepository.findOne({ scope })) === null) {
            await this.entityManager.persistAndFlush(this.changesRepository.create({ scope }));
        }
    }

    async hasChangesSinceLastBuild(): Promise<boolean> {
        return (await this.changesRepository.count()) > 0;
    }

    async deleteChangesSinceLastBuild(): Promise<void> {
        await this.changesRepository.createQueryBuilder().truncate().execute();
    }

    async shouldRebuildAllScopes(): Promise<boolean> {
        return (await this.changesRepository.findOne({ scope: "all" })) !== null;
    }

    async getScopesWithChanges(): Promise<ContentScope[]> {
        return (await this.changesRepository.find({ scope: { $ne: "all" } })).map((change) => change.scope) as ContentScope[];
    }

    async getBuilderCronJobsToStart(scopesWithChanges: ContentScope[]): Promise<V1CronJob[]> {
        const builderCronJobs = await this.buildTemplatesService.getAllBuilderCronJobs();

        const getMatchingBuilderCronJobs = (scope: ContentScope) => {
            const partiallyMatchingCronJobs: V1CronJob[] = [];
            const exactlyMatchingCronJobs: V1CronJob[] = [];

            for (const cronJob of builderCronJobs) {
                const cronJobScope = this.kubernetesService.getContentScope(cronJob);

                if (!cronJobScope) {
                    this.logger.warn(`CronJob ${cronJob.metadata?.name} has no scope, skipping...`);
                    continue;
                }

                // Exact match between job's scope and the scope with changes.
                if (Object.entries(cronJobScope).every(([key, value]) => (scope as Record<string, unknown>)[key] === value)) {
                    exactlyMatchingCronJobs.push(cronJob);
                }

                // Check if scopes match partially. For instance, a job's scope may be { "domain": "main" }, but the change was in
                // { "domain": "main", "language": "en" }. Or the job's scope may be { "domain": "main", "language": "en" }, but the change
                // was in { "domain": "main" }. In both cases, the job should still be started.
                if (Object.entries(cronJobScope).some(([key, value]) => (scope as Record<string, unknown>)[key] === value)) {
                    partiallyMatchingCronJobs.push(cronJob);
                }
            }

            if (exactlyMatchingCronJobs.length === 0 && partiallyMatchingCronJobs.length === 0) {
                throw new Error(`Found changes in scope ${JSON.stringify(scope)} but no matching builder cron job!`);
            }

            return exactlyMatchingCronJobs.length > 0 ? exactlyMatchingCronJobs : partiallyMatchingCronJobs;
        };

        const uniqueMatchingCronJobs = new Set<V1CronJob>();

        for (const scope of scopesWithChanges) {
            for (const job of getMatchingBuilderCronJobs(scope)) {
                uniqueMatchingCronJobs.add(job);
            }
        }

        return Array.from(uniqueMatchingCronJobs);
    }
}
