import { LABEL_PREFIX } from "../kubernetes/kubernetes.constants";

export const BUILDS_MODULE_OPTIONS = "builds-module-options";
export const BUILDS_CONFIG = "builds-config";

/** Annotation for the build Job: defines who triggered the build (CronJob, Manual, ChangesDetected) */
export const TRIGGER_ANNOTATION = `${LABEL_PREFIX}/trigger`;

/** Label which identifies a build job */
export const BUILDER_LABEL = `${LABEL_PREFIX}/builder`;

/** Annotation that includes the content scope used for the CronJob or Job */
export const CONTENT_SCOPE_ANNOTATION = `${LABEL_PREFIX}/content-scope`;
