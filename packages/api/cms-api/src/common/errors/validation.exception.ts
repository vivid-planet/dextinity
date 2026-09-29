import type { ValidationError } from "@nestjs/common";

import { DextinityException } from "./dextinity.exception";

export class DextinityValidationException extends DextinityException {
    constructor(
        message: string,
        readonly errors?: ValidationError[],
    ) {
        super(message);
    }
}
