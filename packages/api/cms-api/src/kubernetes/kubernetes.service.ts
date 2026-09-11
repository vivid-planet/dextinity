import type { BatchV1Api, CoreV1Api, V1CronJob, V1Job, V1ObjectMeta, V1Pod } from "@kubernetes/client-node";
import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { addMinutes, differenceInMinutes } from "date-fns";
import fs from "fs";

import { CONTENT_SCOPE_ANNOTATION } from "../builds/builds.constants";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { KubernetesJobStatus } from "./job-status.enum";
import { KUBERNETES_CONFIG, PARENT_CRON_JOB_LABEL } from "./kubernetes.constants";
import { KubernetesConfig } from "./kubernetes.module";
import { getAnnotation, toLegacyLabelSelector } from "./kubernetes-metadata";

@Injectable()
export class KubernetesService implements OnModuleInit {
    private readonly logger = new Logger(KubernetesService.name);

    isAuthenticated: boolean = false;

    namespace: string;

    batchApi: BatchV1Api;
    coreApi: CoreV1Api;

    constructor(@Inject(KUBERNETES_CONFIG) readonly config: KubernetesConfig) {}

    // @kubernetes/client-node is heavy (~85 MB resident). It's imported lazily here rather than at
    // module load, so importing @dextinity/cms-api doesn't pull it into memory — it's only loaded once
    // this service is instantiated (i.e. the Kubernetes feature is enabled) and connects to a cluster.
    async onModuleInit(): Promise<void> {
        if ("namespace" in this.config) {
            // Local mode, used for development and testing
            this.namespace = this.config.namespace;

            const { KubeConfig, BatchV1Api, CoreV1Api } = await import("@kubernetes/client-node");
            const kc = new KubeConfig();
            kc.loadFromDefault();
            this.batchApi = kc.makeApiClient(BatchV1Api);
            this.coreApi = kc.makeApiClient(CoreV1Api);
            this.isAuthenticated = true;
        } else {
            // Cluster mode
            const namespaceFilePath = "/var/run/secrets/kubernetes.io/serviceaccount/namespace";
            if (fs.existsSync(namespaceFilePath)) {
                this.namespace = fs.readFileSync(namespaceFilePath, "utf8");

                const { KubeConfig, BatchV1Api, CoreV1Api } = await import("@kubernetes/client-node");
                const kc = new KubeConfig();
                kc.loadFromCluster();
                this.batchApi = kc.makeApiClient(BatchV1Api);
                this.coreApi = kc.makeApiClient(CoreV1Api);
                this.isAuthenticated = true;
            } else {
                this.logger.warn("Namespace file not found, cannot connect to Kubernetes API. KubernetesService will not work.");
            }
        }
    }

    get helmRelease(): string {
        return this.config.helmRelease;
    }

    async getCronJob(name: string): Promise<V1CronJob> {
        return this.batchApi.readNamespacedCronJob({ name, namespace: this.namespace });
    }

    async getAllCronJobs(labelSelector: string): Promise<V1CronJob[]> {
        const { items } = await this.batchApi.listNamespacedCronJob({ namespace: this.namespace, labelSelector });

        const legacyLabelSelector = toLegacyLabelSelector(labelSelector);
        if (items.length > 0 || !legacyLabelSelector) {
            return items;
        }

        const { items: legacyItems } = await this.batchApi.listNamespacedCronJob({
            namespace: this.namespace,
            labelSelector: legacyLabelSelector,
        });
        return legacyItems;
    }

    async deleteJob(name: string): Promise<void> {
        const { status } = await this.batchApi.deleteNamespacedJob({ name, namespace: this.namespace, propagationPolicy: "Background" });
        if (status !== "Success") {
            throw new Error(`Error deleting Job "${name}"`);
        }
    }

    async getJob(name: string): Promise<V1Job> {
        return this.batchApi.readNamespacedJob({ name, namespace: this.namespace });
    }

    async getPodsForJob(job: V1Job): Promise<V1Pod[]> {
        const { items } = await this.coreApi.listNamespacedPod({ namespace: this.namespace, labelSelector: `job-name=${job.metadata?.name}` });
        return items;
    }

    async getPodLogs(pod: V1Pod): Promise<string> {
        return this.coreApi.readNamespacedPodLog({ name: pod.metadata?.name ?? "", namespace: this.namespace });
    }

    async getJobLogs(job: V1Job): Promise<string> {
        let logs = "";

        const pods = await this.getPodsForJob(job);
        for (const pod of pods) {
            logs += await this.getPodLogs(pod);
        }

        return logs;
    }

    /**
     * Returns all Jobs for a labelSelector sorted by creationTimestamp DESC (most recent first)
     */
    async getAllJobs(labelSelector?: string): Promise<V1Job[]> {
        const { items } = await this.batchApi.listNamespacedJob({ namespace: this.namespace, labelSelector });

        const legacyLabelSelector = labelSelector ? toLegacyLabelSelector(labelSelector) : undefined;
        const jobs =
            items.length > 0 || !legacyLabelSelector
                ? items
                : (await this.batchApi.listNamespacedJob({ namespace: this.namespace, labelSelector: legacyLabelSelector })).items;

        return jobs.sort((a, b) => (b.metadata?.creationTimestamp?.getTime() ?? 0) - (a.metadata?.creationTimestamp?.getTime() ?? 0));
    }

    async getAllJobsForCronJob(cronJob: string) {
        return this.getAllJobs(`${PARENT_CRON_JOB_LABEL}=${cronJob}`);
    }

    async getLatestJobForCronJob(cronJob: string) {
        const jobs = await this.getAllJobsForCronJob(cronJob);
        return jobs.shift();
    }

    async createJobFromCronJob(cronJob: V1CronJob, overwriteJobMetaData: V1ObjectMeta): Promise<V1Job> {
        return this.batchApi.createNamespacedJob({
            namespace: this.namespace,
            body: {
                apiVersion: "batch/v1",
                kind: "Job",
                metadata: { ...cronJob.spec?.jobTemplate.metadata, ...overwriteJobMetaData },
                spec: cronJob.spec?.jobTemplate.spec,
            },
        });
    }

    getStatusForKubernetesJob(job: V1Job): KubernetesJobStatus {
        let status = KubernetesJobStatus.pending;
        if (job.status?.active ?? 0 > 0) {
            status = KubernetesJobStatus.active;
        }
        // A job can have both succeeded = 1 and failed = 1 states. This may happend due to a job's restart policy. For instance, a job may fail on
        // the first attempt (failed = 1) and succeed on the second attempt (succeeded = 1). We therefore check the succeeded status before the failed
        // status.
        else if (job.status?.succeeded ?? 0 > 0) {
            status = KubernetesJobStatus.succeeded;
        } else if (job.status?.failed ?? 0 > 0) {
            status = KubernetesJobStatus.failed;
        }
        return status;
    }

    /**
     * Estimate Job completion time based on previos run
     * Uses labelSelector to catch manual runs as well
     */
    async estimateJobCompletionTime(job: V1Job, labelSelector: string): Promise<Date | undefined> {
        const jobStatus = this.getStatusForKubernetesJob(job);
        if (jobStatus === KubernetesJobStatus.failed || jobStatus === KubernetesJobStatus.succeeded) {
            return;
        }

        const jobStartTime = job.status?.startTime;
        if (!jobStartTime) {
            return;
        }

        const previousJobs = await this.getAllJobs(labelSelector);
        if (!previousJobs || previousJobs.length < 1) {
            return;
        }
        const previousJob = previousJobs[0];

        const previousJobStartTime = previousJob.status?.startTime;
        const previousJobCompletionTime = previousJob.status?.completionTime;

        if (!previousJobStartTime || !previousJobCompletionTime) {
            return;
        }

        const previousJobRuntime = differenceInMinutes(previousJobCompletionTime, previousJobStartTime);
        const estimatedCompletionTime = addMinutes(jobStartTime, previousJobRuntime);

        return estimatedCompletionTime;
    }

    getContentScope(resource: V1Job | V1CronJob): ContentScope | null {
        const contentScopeAnnotation = getAnnotation(resource, CONTENT_SCOPE_ANNOTATION);

        if (contentScopeAnnotation) {
            let json = JSON.parse(contentScopeAnnotation);

            // the contentScopeAnnotation is an escaped json string (e.g. "{ \"domain\": \"main\", \"language\": \"en\" }")
            // therefore JSON.parse() must be executed twice (https://stackoverflow.com/a/25721227)
            if (typeof json !== "object") {
                json = JSON.parse(json);
            }

            if (typeof json !== "object" || json === null || Object.keys(json).length === 0) {
                return null;
            }

            return json;
        }

        return null;
    }
}
