import type { EntityMetadata } from "@mikro-orm/postgresql";
import { plural } from "pluralize";

function classNameToInstanceName(className: string): string {
    return className[0].toLocaleLowerCase() + className.slice(1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildNameVariants(metadata: EntityMetadata<any>): {
    classNameSingular: string;
    classNamePlural: string;
    instanceNameSingular: string;
    instanceNamePlural: string;
    fileNameSingular: string;
    fileNamePlural: string;
} {
    const classNameSingular = metadata.className;
    const classNamePlural = plural(metadata.className);
    const instanceNameSingular = classNameToInstanceName(classNameSingular);
    const instanceNamePlural = classNameToInstanceName(classNamePlural);
    const fileNameSingular = instanceNameSingular.replace(/[A-Z]/g, (i) => `-${i.toLocaleLowerCase()}`);
    const fileNamePlural = instanceNamePlural.replace(/[A-Z]/g, (i) => `-${i.toLocaleLowerCase()}`);
    return {
        classNameSingular,
        classNamePlural,
        instanceNameSingular,
        instanceNamePlural,
        fileNameSingular,
        fileNamePlural,
    };
}
