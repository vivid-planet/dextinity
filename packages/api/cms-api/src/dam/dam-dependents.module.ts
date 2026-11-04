import { DynamicModule, Module, Type } from "@nestjs/common";

import { DependentsResolverFactory } from "../dependencies/dependents.resolver.factory";
import { FileInterface } from "./files/entities/file.entity";

interface DamDependentsModuleOptions {
    File: Type<FileInterface>;
}

@Module({})
export class DamDependentsModule {
    private static registered = false;

    static register({ File }: DamDependentsModuleOptions): DynamicModule {
        // Every registration creates another resolver adding the dependents field to the file type, which breaks the schema.
        // DamModule registers the module internally, so registering both would do exactly that.
        if (DamDependentsModule.registered) {
            throw new Error(
                "DamDependentsModule has already been registered. It is registered by DamModule, so register either DamModule or DamDependentsModule, not both.",
            );
        }
        DamDependentsModule.registered = true;

        return {
            module: DamDependentsModule,
            providers: [DependentsResolverFactory.create(File)],
        };
    }
}
