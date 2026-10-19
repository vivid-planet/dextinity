import type { ValidationError } from "@nestjs/common";

import type { ValidationErrorDetail } from "../../blocks/validation/validation-error-details";
import { DextinityException } from "./dextinity.exception";

export class DextinityValidationException extends DextinityException {
    constructor(
        message: string,
        readonly errors?: ValidationError[],
        readonly errorDetails?: ValidationErrorDetail[],
    ) {
        super(message);
    }
}
