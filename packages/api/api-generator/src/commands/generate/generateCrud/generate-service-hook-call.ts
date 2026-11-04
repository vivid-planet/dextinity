import type { EntityProperty } from "@mikro-orm/core";

import type { findHooksService } from "../utils/find-hooks-service";

export function generateServiceHookCall(
    type: "validateCreateInput" | "validateUpdateInput",
    {
        hooksService,
        instanceNameSingular,
        dedicatedResolverArgProps,
        scopeProp,
    }: {
        hooksService: ReturnType<typeof findHooksService>;
        instanceNameSingular: string;
        dedicatedResolverArgProps: EntityProperty[];
        scopeProp: EntityProperty | undefined;
    },
) {
    if (!hooksService) {
        return "";
    }

    const hook = type === "validateCreateInput" ? hooksService.validateCreateInput : hooksService.validateUpdateInput;
    if (!hook) {
        return "";
    }
    const options = [];
    if (hook.options?.includes("currentUser")) {
        options.push("currentUser: user");
    }
    if (hook.options?.includes("scope")) {
        if (!scopeProp) {
            throw new Error(`${type} hook expects scope, but no scopeProp found`);
        }
        options.push("scope");
    }
    if (hook.options?.includes("args")) {
        if (type === "validateUpdateInput") {
            throw new Error("validateUpdateInput hook cannot have args option, as args are only available during creation");
        }
        if (!dedicatedResolverArgProps.length) {
            throw new Error(`${type} hook expects args, but no dedicatedResolverArgProps found`);
        }
        const argsCode = dedicatedResolverArgProps.map((prop) => {
            return prop.name;
        });
        options.push(`args: { ${argsCode.join(", ")} }`);
    }
    if (hook.options?.includes("entity")) {
        if (type === "validateCreateInput") {
            throw new Error("validateCreateInput hook cannot have entity option");
        }
        options.push(`entity: ${instanceNameSingular}`);
    }
    const optionsCode = options.join(", ");
    return `
    const errors = await this.${instanceNameSingular}Service.${type}(input${optionsCode ? `, { ${optionsCode} }` : ""});
    if (errors.length > 0) {
        return { errors };
    }
    `;
}
