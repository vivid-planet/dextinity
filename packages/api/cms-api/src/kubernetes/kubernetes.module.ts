import { type DynamicModule, Global, Module } from "@nestjs/common";

import { KUBERNETES_CONFIG } from "./kubernetes.constants.js";
import { KubernetesService } from "./kubernetes.service.js";

type ClusterKubernetesConfig = {
    helmRelease: string;
};

type LocalKubernetesConfig = {
    namespace: string;
    helmRelease: string;
};

export type KubernetesConfig = ClusterKubernetesConfig | LocalKubernetesConfig;

@Module({})
@Global()
export class KubernetesModule {
    static register(options: KubernetesConfig): DynamicModule {
        const kubernetesConfigProvider = {
            provide: KUBERNETES_CONFIG,
            useValue: options,
        };

        return {
            module: KubernetesModule,
            providers: [kubernetesConfigProvider, KubernetesService],
            exports: [KubernetesService],
        };
    }
}
