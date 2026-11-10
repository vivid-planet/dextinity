import { registerEnumType } from "@nestjs/graphql";

export enum KubernetesJobStatus {
    pending = "pending",
    active = "active",
    succeeded = "succeeded",
    failed = "failed",
}
registerEnumType(KubernetesJobStatus, { name: "KubernetesJobStatus" });
