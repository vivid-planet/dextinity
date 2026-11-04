import type { LoggerService } from "@nestjs/common";
import type { ValidationError as ClassValidationError } from "class-validator";
import type { Transform } from "stream";

export type PipeData = Record<string, unknown>;
export type PipeMetadata = Record<string, unknown>;

type ParserOptions = Record<string, unknown>;
export interface ValidationError extends ClassValidationError {
    name?: string | number;
    errorMessage: string;
    value?: string;
}

export type ImporterPipe = {
    getPipe(logger: LoggerService, options?: ParserOptions): Transform;
};

export type CompositeImporterPipe = {
    getPipes(logger: LoggerService, options: ParserOptions): Transform[];
};
