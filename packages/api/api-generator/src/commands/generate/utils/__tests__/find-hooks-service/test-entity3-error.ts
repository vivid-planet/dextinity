import type { MutationError } from "@dextinity/cms-api";

export enum TestEntity3MutationErrorCode {
    titleTooShort = "titleTooShort",
}
export class TestEntity3MutationError implements MutationError {
    field?: string;
    code: TestEntity3MutationErrorCode;
}
