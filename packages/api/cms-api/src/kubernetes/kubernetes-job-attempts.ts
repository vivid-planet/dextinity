import type { V1Job, V1JobCondition, V1Pod } from "@kubernetes/client-node";

export type KubernetesJobAttempt = {
    podName: string;
    startedAt?: Date;
    finishedAt?: Date;
    terminationReason?: string;
    exitCode?: number;
};

export function sortPodsByCreationTimestamp(pods: V1Pod[]): V1Pod[] {
    return [...pods].sort((a, b) => (a.metadata?.creationTimestamp?.getTime() ?? 0) - (b.metadata?.creationTimestamp?.getTime() ?? 0));
}

export function groupPodsByJobName(pods: V1Pod[]): Map<string, V1Pod[]> {
    const podsByJobName = new Map<string, V1Pod[]>();
    for (const pod of pods) {
        const jobName = pod.metadata?.labels?.["job-name"];
        if (!jobName) {
            continue;
        }
        podsByJobName.set(jobName, [...(podsByJobName.get(jobName) ?? []), pod]);
    }
    return podsByJobName;
}

export function getJobAttempt(pod: V1Pod): KubernetesJobAttempt {
    const terminatedStates = (pod.status?.containerStatuses ?? [])
        .map((containerStatus) => containerStatus.state?.terminated)
        .filter((terminated) => terminated !== undefined);
    // Sidecar containers may terminate normally while the main container was killed, so the abnormal termination takes precedence
    const terminated = terminatedStates.find((state) => state.exitCode !== 0) ?? terminatedStates[0];

    return {
        podName: pod.metadata?.name ?? "",
        startedAt: pod.status?.startTime,
        finishedAt: terminated?.finishedAt,
        // Set on the Pod (not the container) when it was killed by the Job's activeDeadlineSeconds or evicted
        terminationReason: pod.status?.reason ?? terminated?.reason,
        exitCode: terminated?.exitCode,
    };
}

export function getJobAttempts(pods: V1Pod[]): KubernetesJobAttempt[] {
    return sortPodsByCreationTimestamp(pods).map(getJobAttempt);
}

export function hasTrueCondition(job: V1Job, type: string): boolean {
    return job.status?.conditions?.some((condition) => condition.type === type && condition.status === "True") ?? false;
}

export function getJobFailedCondition(job: V1Job): V1JobCondition | undefined {
    return job.status?.conditions?.find((condition) => condition.type === "Failed" && condition.status === "True");
}

export function formatAttemptLogHeader(attempt: KubernetesJobAttempt, attemptNumber: number, totalAttempts: number): string {
    const startedAt = attempt.startedAt ? `started ${attempt.startedAt.toISOString()}` : "not started";
    return `===== Attempt ${attemptNumber}/${totalAttempts}: pod ${attempt.podName}, ${startedAt} =====`;
}

export function formatAttemptLogFooter(attempt: KubernetesJobAttempt, attemptNumber: number, totalAttempts: number): string {
    if (attempt.terminationReason === undefined && attempt.exitCode === undefined) {
        return `===== Attempt ${attemptNumber}/${totalAttempts}: still running =====`;
    }

    const details = [
        attempt.terminationReason ?? "unknown reason",
        attempt.exitCode !== undefined ? `exit code ${attempt.exitCode}` : undefined,
        attempt.finishedAt ? `finished ${attempt.finishedAt.toISOString()}` : undefined,
    ].filter((detail) => detail !== undefined);

    return `===== Attempt ${attemptNumber}/${totalAttempts} ended: ${details.join(", ")} =====`;
}

export function formatJobFailedLogLine(condition: V1JobCondition): string {
    const reason = condition.reason ?? "unknown reason";
    return `===== Job failed: ${condition.message ? `${reason} (${condition.message})` : reason} =====`;
}
