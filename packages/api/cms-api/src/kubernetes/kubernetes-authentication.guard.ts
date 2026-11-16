import { type CanActivate, Injectable, Logger } from "@nestjs/common";

import { KubernetesService } from "./kubernetes.service.js";

@Injectable()
export class KubernetesAuthenticationGuard implements CanActivate {
    private readonly logger = new Logger(KubernetesAuthenticationGuard.name);

    constructor(private readonly kubernetesService: KubernetesService) {}

    canActivate(): boolean {
        if (!this.kubernetesService.isAuthenticated) {
            this.logger.warn("Not allowed, because the handler is related to Kubernetes and the Kubernetes service is not authenticated.");
            return false;
        }

        return true;
    }
}
