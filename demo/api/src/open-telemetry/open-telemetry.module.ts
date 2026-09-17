import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { ApiMetricsInterceptor } from "./api-metrics.interceptor";
import { ApiMetricsMiddleware } from "./api-metrics.middleware";

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
