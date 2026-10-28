import type { ValidationError } from "@nestjs/common";

export interface FormattedValidationError {
    /**
     * Path of the invalid value in the validated input, for instance `content.blocks[3].props.headline`.
     */
    path: string;
    message: string;
}

/**
 * Flattens the tree of class-validator errors into one error per path and message.
 */
export function formatValidationErrors(errors: ValidationError[]): FormattedValidationError[] {
    const formattedErrors = new Map<string, FormattedValidationError>();

    for (const error of errors) {
        collectErrors({ error, path: joinPath("", error.property), formattedErrors });
    }

    return Array.from(formattedErrors.values());
}

function collectErrors({
    error,
    path,
    formattedErrors,
}: {
    error: ValidationError;
    path: string;
    formattedErrors: Map<string, FormattedValidationError>;
}) {
    const constraints = Object.entries(error.constraints ?? {});
    // A list that isn't an array also fails the checks of its items, for instance "nestedValidation" and "isObject".
    const relevantConstraints = constraints.some(([constraint]) => constraint === "isArray")
        ? constraints.filter(([constraint]) => constraint === "isArray")
        : constraints;

    // class-validator reports the errors of a child block twice if it is validated twice, for instance by an additional @ValidateNested().
    for (const [, message] of relevantConstraints) {
        formattedErrors.set(`${path}\n${message}`, { path, message });
    }

    const value = error.value ?? error.children?.[0]?.target;

    for (const child of error.children ?? []) {
        let childPath: string;

        if (value instanceof Map) {
            // composeBlocks keeps its child blocks in a map, while the input has them as fields of the block.
            childPath = joinPath(removeLastSegment(path), child.property);
        } else if (Array.isArray(value)) {
            childPath = `${path}[${child.property}]`;
        } else {
            childPath = joinPath(path, child.property);
        }

        collectErrors({ error: child, path: childPath, formattedErrors });
    }
}

function joinPath(path: string, property: string): string {
    return path === "" ? property : `${path}.${property}`;
}

function removeLastSegment(path: string): string {
    const index = path.lastIndexOf(".");

    return index === -1 ? "" : path.slice(0, index);
}
