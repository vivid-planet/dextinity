import { runConsoleCommand } from "@dextinity/cms-api";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@src/app.module.js";
import { useContainer } from "class-validator";

import { createConfig } from "./config/config.js";

const config = createConfig(process.env);
const appModule = AppModule.forRoot(config);

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(appModule, {
        logger: ["error", "warn", "log"],
    });

    try {
        await app.init();

        // class-validator should use Nest for dependency injection.
        // See https://github.com/nestjs/nest/issues/528,
        //     https://github.com/typestack/class-validator#using-service-container.
        useContainer(app.select(appModule), { fallbackOnErrors: true });

        await runConsoleCommand(app);

        await app.close();
        process.exit(0);
    } catch (e) {
        console.error(e);

        await app.close();
        process.exit(1);
    }
}

bootstrap();
