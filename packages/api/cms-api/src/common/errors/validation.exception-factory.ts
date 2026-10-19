import type { ValidationError } from "@nestjs/common";

import { getValidationErrorDetails } from "../../blocks/validation/validation-error-details";
import { DextinityValidationException } from "./validation.exception";

export function ValidationExceptionFactory(errors: ValidationError[]): DextinityValidationException {
    return new DextinityValidationException("Validation failed", errors, getValidationErrorDetails(errors));
}
