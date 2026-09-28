export const KUBERNETES_CONFIG = "kubernetes-config";

/** Prefix of the labels and annotations read from Kubernetes resources */
export const LABEL_PREFIX = "dextinity.com";

/** Prefix used before the rebranding to Dextinity. Labels and annotations using it are still supported. */
export const LEGACY_LABEL_PREFIX = "comet-dxp.com";

/** Label which specifies the instance a build is assigned to (Helm-Release) */
export const INSTANCE_LABEL = `${LABEL_PREFIX}/instance`;
/**
 * Label which specifies the CronJob for a Job
 * k8s ownerReference is not set, if job is not created by CronJob Controller
 * */
export const PARENT_CRON_JOB_LABEL = `${LABEL_PREFIX}/parent-cron-job`;

/** Annotation for a cron job or job to provide a human readable name */
export const LABEL_ANNOTATION = `${LABEL_PREFIX}/label`;
