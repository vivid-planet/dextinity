---
title: Sentry Module
---

SentryModule is a NestJS module that integrates Sentry for error tracking. To use the module, import it into your application's root module and call the `forRootAsync` method. For more detailed configurations and advanced usage please visit [Sentry](https://docs.sentry.io/platforms/javascript/guides/node/configuration/).

```ts
// app.module.ts
@Module({
    imports: [
        SentryModule.forRootAsync({
            dsn: "sentry_dsn_url",
            environment: "dev",
            shouldReportException: (exception) => {
                // Custom logic to determine if the exception should be reported
                return true;
            },
        }),
    ],
})
export class AppModule {}
```

In your main file, add Sentry handlers to capture requests and errors:

```diff
  // main.ts
  import { NestFactory } from "@nestjs/core";
  import { NestExpressApplication } from "@nestjs/platform-express";
+ import * as Sentry from "@sentry/node";
  import { AppModule } from "@src/app.module";
  import { createConfig } from "@src/config/config";

  async function bootstrap() {
      const config = createConfig(process.env);
      const appModule = AppModule.forRoot(config);
      const app = await NestFactory.create<NestExpressApplication>(appModule);

+     Sentry.setupExpressErrorHandler(app);

      await app.listen(3000);
  }
  bootstrap();
```

:::note

`@sentry/node` v11 deprecates `setupExpressErrorHandler`, but keep calling it. Sentry only captures Express errors automatically when it's initialized before Express is loaded, and `SentryModule` initializes it afterwards.

:::
