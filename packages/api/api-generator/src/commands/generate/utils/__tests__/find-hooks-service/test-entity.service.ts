import type { CrudGeneratorHooksService, MutationError } from "@dextinity/cms-api";

export enum TestMutationErrorCode {
    titleTooShort = "titleTooShort",
}
/*
registerEnumType(TestMutationErrorCode, {
    name: "TestMutationErrorCode",
    valuesMap: {
        titleTooShort: {
            description: "Title must be at least 3 characters long when creating a product, except for foo",
        },
    },
});
*/
/*@ObjectType()*/
export class TestMutationError implements MutationError {
    /*@Field({ nullable: true })*/
    field?: string;

    /*@Field(() => TestMutationErrorCode)*/
    code: TestMutationErrorCode;
}

export class TestEntityService implements CrudGeneratorHooksService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async validateCreateInput(input: any): Promise<TestMutationError[]> {
        return [];
    }
}
