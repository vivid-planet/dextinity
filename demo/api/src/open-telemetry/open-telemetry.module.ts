import { type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { ApiMetricsInterceptor } from "./api-metrics.interceptor.js";
import { ApiMetricsMiddleware } from "./api-metrics.middleware.js";

@Module({
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ApiMetricsInterceptor,
        },
    ],
})
export class OpenTelemetryModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ApiMetricsMiddleware).forRoutes("*");
    }
}
