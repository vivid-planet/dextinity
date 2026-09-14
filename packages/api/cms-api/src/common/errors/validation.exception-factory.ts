import type { ValidationError } from "@nestjs/common";

import { DextinityValidationException } from "./validation.exception";

export function ValidationExceptionFactory(errors: ValidationError[]): DextinityValidationException {
    return new DextinityValidationException("Validation failed", errors);
}
