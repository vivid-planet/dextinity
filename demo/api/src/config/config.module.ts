import { type DynamicModule, Global, Module } from "@nestjs/common";

import type { Config } from "./config.js";

export const CONFIG = "config";

@Global()
@Module({})
export class ConfigModule {
    static forRoot(config: Config): DynamicModule {
        return {
            module: ConfigModule,
            providers: [
                {
                    provide: CONFIG,
                    useValue: config,
                },
            ],
            exports: [CONFIG],
        };
    }
}
