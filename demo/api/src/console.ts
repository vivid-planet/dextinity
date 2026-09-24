import { AppModule } from "@src/app.module";
import { useContainer } from "class-validator";
import { CommandFactory } from "nest-commander";

import { createConfig } from "./config/config";

const config = createConfig(process.env);
const appModule = AppModule.forRoot(config);

async function bootstrap() {
    const app = await CommandFactory.createWithoutRunning(appModule, {
        logger: ["error", "warn", "log"],
        serviceErrorHandler: async (error) => {
            console.error(error);
            process.exit(1);
        },
    });

    try {
        await app.init();

        // class-validator should use Nest for dependency injection.
        // See https://github.com/nestjs/nest/issues/528,
        //     https://github.com/typestack/class-validator#using-service-container.
        useContainer(app.select(appModule), { fallbackOnErrors: true });

        await CommandFactory.runApplication(app);

        await app.close();
        process.exit(0);
    } catch (e) {
        console.error(e);

        await app.close();
        process.exit(1);
    }
}

void bootstrap();
