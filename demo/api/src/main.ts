import { CdnGuard, ExceptionFilter, ValidationExceptionFactory } from "@dextinity/cms-api";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { MCP_STRATEGY, type McpStrategy } from "@rekog/mcp-nest";
import * as Sentry from "@sentry/node";
import { AppModule } from "@src/app.module.js";
import { useContainer } from "class-validator";
import compression from "compression";
import cookieParser from "cookie-parser";
import { json } from "express";
import helmet from "helmet";

import { createConfig } from "./config/config.js";

async function bootstrap(): Promise<void> {
    const config = createConfig(process.env);
    const appModule = AppModule.forRoot(config);
    const app = await NestFactory.create<NestExpressApplication>(appModule);

    Sentry.setupExpressErrorHandler(app);

    // class-validator should use Nest for dependency injection.
    // See https://github.com/nestjs/nest/issues/528,
    //     https://github.com/typestack/class-validator#using-service-container.
    useContainer(app.select(appModule), { fallbackOnErrors: true });

    app.setGlobalPrefix("api");
    app.enableCors({
        origin: config.corsAllowedOrigin,
        methods: ["GET", "POST"],
        credentials: false,
        maxAge: 600,
    });

    app.useGlobalFilters(new ExceptionFilter(config.debug));
    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: ValidationExceptionFactory,
            transform: true,
            forbidNonWhitelisted: true,
            whitelist: true,
        }),
    );

    app.disable("x-powered-by");

    app.use(
        helmet({
            contentSecurityPolicy:
                process.env.NODE_ENV !== "production"
                    ? false
                    : {
                          directives: {
                              "default-src": ["'none'"],
                          },
                          useDefaults: false, // Disable default directives
                      },
            xFrameOptions: false, // Disable non-standard header
            strictTransportSecurity: {
                // Enable HSTS
                maxAge: 63072000, // 2 years (recommended when subdomains are included)
                includeSubDomains: true,
                preload: true,
            },
            referrerPolicy: {
                policy: "no-referrer", // No referrer information is sent along with requests
            },
            xContentTypeOptions: true, // value="nosniff" (prevent MIME sniffing)
            xDnsPrefetchControl: false, // Disable non-standard header
            xDownloadOptions: true, // value="noopen" (prevent IE from executing downloads in the context of the site)
            xPermittedCrossDomainPolicies: true, // value="none" (prevent the browser from MIME sniffing)
            originAgentCluster: true, // value=?1
            crossOriginResourcePolicy: {
                policy: "same-site", // This allows the resource to be shared with the same site (all subdomains/ports are included)
            },
        }),
    );
    // The AI Hub chat sends the whole conversation with every message, including the results of the host tools, so a
    // long chat outgrows the limit below. The AI Hub itself accepts 10 MB. This parser has to come first: the one below
    // skips a body that is already parsed.
    app.use("/api/ai-hub", json({ limit: "10mb" }));
    app.use(json({ limit: "1mb" })); // increase default limit of 100kb for saving large pages
    app.use(compression());
    app.use(cookieParser());

    // if CDN is enabled, make sure all traffic is either coming from the CDN or internal sources
    if (config.cdn.originCheckSecret) {
        app.useGlobalGuards(new CdnGuard({ headerName: "x-cdn-origin-check", headerValue: config.cdn.originCheckSecret }));
    }

    // The MCP server of the admin's AI Mode is a NestJS microservice transport strategy, built and provided by the
    // MCP module. It needs the HTTP adapter for its streamable-HTTP transport, and must be started before listen() so
    // its handlers are bound before the first request arrives. The /api/mcp route belongs to a controller of the app.
    if (config.aiHub) {
        const mcpStrategy = app.get<McpStrategy>(MCP_STRATEGY);
        mcpStrategy.setHttpAdapter(app.getHttpAdapter());
        app.connectMicroservice({ strategy: mcpStrategy });
        await app.startAllMicroservices();
    }

    const port = config.apiPort;
    const host = config.serverHost;
    await app.listen(port, host);
    console.log(`Application is running on: http://${host}:${port}/`);
}
bootstrap();
