import { UserPermissionsStorageService } from "@dextinity/cms-api";
import { AppModule } from "@src/app.module";
import { SYSTEM_USER_NAME } from "@src/auth/constants";
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

        await app.get(UserPermissionsStorageService).runWith({ user: SYSTEM_USER_NAME }, async () => {
            await CommandFactory.runApplication(app);

            await app.close();
            process.exit(0);
        });
    } catch (e) {
        console.error(e);

        await app.close();
        process.exit(1);
    }
}

bootstrap();
