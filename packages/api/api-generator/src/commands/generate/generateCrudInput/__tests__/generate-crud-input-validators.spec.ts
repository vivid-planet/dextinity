import { IsValidRedirectSource } from "@dextinity/cms-api";
import { BaseEntity, defineConfig, Entity, MikroORM, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import {
    IsEmail,
    IsISO8601,
    IsOptional,
    IsString,
    Length,
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { generateCrud } from "../../generateCrud/generate-crud";
import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";

export const IsTrueAsString = (validationOptions?: ValidationOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (object: Record<string, any>, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsSlugConstraint,
        });
    };
};

@ValidatorConstraint({ name: "IsTrueAsString", async: true })
class IsSlugConstraint implements ValidatorConstraintInterface {
    async validate(value: string): Promise<boolean> {
        return value === "true";
    }

    defaultMessage(): string {
        return "string is not 'true'";
    }
}

@Entity()
export class TestEntityWithEmail extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @IsEmail()
    @IsString()
    @Property({ columnType: "text" })
    email: string;
}

@Entity()
export class TestEntityWithCaseSensitiveConstraintName extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @IsISO8601()
    @Property({ columnType: "text" })
    dateAsString: string;
}

@Entity()
export class TestEntityWithShortenedDecoratorName extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Length(2, 5)
    @Property({ columnType: "text" })
    dateAsString: string;
}

@Entity()
export class TestEntityWithRelativeImportDecorator extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @IsValidRedirectSource()
    @Property({ columnType: "text" })
    source: string;
}

@Entity()
export class TestEntityWithDuplicateDefaultDecorator extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @IsString()
    @IsOptional()
    @Property({ columnType: "text", nullable: true })
    name?: string;
}

@Entity()
export class TestEntityWithValidatorDefinedInFile extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @IsTrueAsString()
    @Property({ columnType: "text" })
    trueString: string;
}

describe("GenerateDefinedValidatorDecorators", () => {
    describe("simple validator", () => {
        it("should set IsEmail decorator", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithEmail],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithEmail"));
            const formattedOut = await formatGeneratedFiles(out);
            const file = formattedOut.find((file) => file.name === "dto/test-entity-with-email.input.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);
            const classes = source.getClasses();
            const cls = classes[0];
            const structure = cls.getStructure();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const prop = structure.properties![0];
            expect(prop.name).toBe("email");

            const decorators = prop.decorators?.map((decorator) => decorator.name);
            expect(decorators).toContain("IsEmail");

            const importDeclarations = source.getImportDeclarations();
            const isEmailImport = importDeclarations.find((getImportDeclaration) =>
                getImportDeclaration.getNamedImports().some((namedImport) => namedImport.getName() === "IsEmail"),
            );
            expect(isEmailImport).toBeDefined();
            expect(isEmailImport?.getModuleSpecifierValue()).toBe("class-validator");

            orm.close();
        });

        describe("case sensitive validator", () => {
            it("should set IsISO8601 decorator", async () => {
                LazyMetadataStorage.load();
                const orm = await MikroORM.init(
                    defineConfig({
                        dbName: "test-db",
                        connect: false,
                        entities: [TestEntityWithCaseSensitiveConstraintName],
                    }),
                );

                const out = await generateCrud(
                    { requiredPermission: testPermission },
                    orm.em.getMetadata().get("TestEntityWithCaseSensitiveConstraintName"),
                );
                const formattedOut = await formatGeneratedFiles(out);
                const file = formattedOut.find((file) => file.name === "dto/test-entity-with-case-sensitive-constraint-name.input.ts");
                if (!file) {
                    throw new Error("File not found");
                }
                const source = parseSource(file.content);
                const classes = source.getClasses();
                const cls = classes[0];
                const structure = cls.getStructure();

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("dateAsString");
                const decorators = prop.decorators?.map((i) => i.name);
                expect(decorators).toContain("IsISO8601");

                const importDeclarations = source.getImportDeclarations();
                const isIsoImport = importDeclarations.find((getImportDeclaration) =>
                    getImportDeclaration.getNamedImports().some((namedImport) => namedImport.getName() === "IsISO8601"),
                );
                expect(isIsoImport).toBeDefined();
                expect(isIsoImport?.getModuleSpecifierValue()).toBe("class-validator");

                orm.close();
            });
        });

        describe("shortened decorator name", () => {
            it("should set Length decorator", async () => {
                LazyMetadataStorage.load();
                const orm = await MikroORM.init(
                    defineConfig({
                        dbName: "test-db",
                        connect: false,
                        entities: [TestEntityWithShortenedDecoratorName],
                    }),
                );

                const out = await generateCrud(
                    { requiredPermission: testPermission },
                    orm.em.getMetadata().get("TestEntityWithShortenedDecoratorName"),
                );
                const formattedOut = await formatGeneratedFiles(out);
                const file = formattedOut.find((file) => file.name === "dto/test-entity-with-shortened-decorator-name.input.ts");
                if (!file) {
                    throw new Error("File not found");
                }
                const source = parseSource(file.content);
                const classes = source.getClasses();
                const cls = classes[0];
                const structure = cls.getStructure();

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("dateAsString");
                const decorators = prop.decorators?.map((decorator) => decorator.name);
                expect(decorators).toContain("Length");

                const importDeclarations = source.getImportDeclarations();
                const lengthImport = importDeclarations.find((getImportDeclaration) =>
                    getImportDeclaration.getNamedImports().some((namedImport) => namedImport.getName() === "Length"),
                );
                expect(lengthImport).toBeDefined();
                expect(lengthImport?.getModuleSpecifierValue()).toBe("class-validator");

                orm.close();
            });
        });

        describe("decorator with arguments", () => {
            it("should set defined arguments", async () => {
                LazyMetadataStorage.load();
                const orm = await MikroORM.init(
                    defineConfig({
                        dbName: "test-db",
                        connect: false,
                        entities: [TestEntityWithShortenedDecoratorName],
                    }),
                );

                const out = await generateCrud(
                    { requiredPermission: testPermission },
                    orm.em.getMetadata().get("TestEntityWithShortenedDecoratorName"),
                );
                const formattedOut = await formatGeneratedFiles(out);
                const file = formattedOut.find((file) => file.name === "dto/test-entity-with-shortened-decorator-name.input.ts");
                if (!file) {
                    throw new Error("File not found");
                }
                const source = parseSource(file.content);
                const classes = source.getClasses();
                const cls = classes[0];
                const structure = cls.getStructure();

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("dateAsString");
                const lengthDecorator = prop.decorators?.find((decorator) => decorator.name === "Length");
                expect(lengthDecorator).toBeDefined();
                expect(lengthDecorator?.arguments).toEqual(["2", "5"]);

                const importDeclarations = source.getImportDeclarations();
                const lengthImport = importDeclarations.find((getImportDeclaration) =>
                    getImportDeclaration.getNamedImports().some((namedImport) => namedImport.getName() === "Length"),
                );
                expect(lengthImport).toBeDefined();
                expect(lengthImport?.getModuleSpecifierValue()).toBe("class-validator");

                await orm.close();
            });
        });

        describe("relative path", () => {
            it("should set IsValidRedirectSource decorator", async () => {
                LazyMetadataStorage.load();
                const orm = await MikroORM.init(
                    defineConfig({
                        dbName: "test-db",
                        connect: false,
                        entities: [TestEntityWithRelativeImportDecorator],
                    }),
                );

                const out = await generateCrud(
                    { requiredPermission: testPermission },
                    orm.em.getMetadata().get("TestEntityWithRelativeImportDecorator"),
                );
                const formattedOut = await formatGeneratedFiles(out);
                const file = formattedOut.find((file) => file.name === "dto/test-entity-with-relative-import-decorator.input.ts");
                if (!file) {
                    throw new Error("File not found");
                }
                const source = parseSource(file.content);
                const classes = source.getClasses();
                const cls = classes[0];
                const structure = cls.getStructure();

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("source");
                const decorators = prop.decorators?.map((i) => i.name);
                expect(decorators).toContain("IsValidRedirectSource");

                const importDeclarations = source.getImportDeclarations();
                const isSlugImport = importDeclarations.find((getImportDeclaration) =>
                    getImportDeclaration.getNamedImports().some((namedImport) => namedImport.getName() === "IsValidRedirectSource"),
                );
                expect(isSlugImport).toBeDefined();
                expect(isSlugImport?.getModuleSpecifierValue()).toBe("@dextinity/cms-api");

                await orm.close();
            });
        });
    });

    describe("validator defined in file", () => {
        it("should set IsTrueAsString decorator", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithValidatorDefinedInFile],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithValidatorDefinedInFile"));
            const formattedOut = await formatGeneratedFiles(out);
            const file = formattedOut.find((file) => file.name === "dto/test-entity-with-validator-defined-in-file.input.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);
            const classes = source.getClasses();
            const cls = classes[0];
            const structure = cls.getStructure();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const prop = structure.properties![0];
            expect(prop.name).toBe("trueString");
            const decorators = prop.decorators?.map((i) => i.name);
            expect(decorators).toContain("IsTrueAsString");

            const importDeclarations = source.getImportDeclarations();
            const isTrueAsStringImport = importDeclarations.find((getImportDeclaration) =>
                getImportDeclaration.getNamedImports().some((namedImport) => namedImport.getName() === "IsTrueAsString"),
            );
            expect(isTrueAsStringImport).toBeDefined();
            expect(isTrueAsStringImport?.getModuleSpecifierValue()).toBe("../../generate-crud-input-validators.spec");

            await orm.close();
        });
    });

    describe("duplicate class-validator imports", () => {
        it("should not have duplicate imports from class-validator", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithDuplicateDefaultDecorator],
                }),
            );

            const out = await generateCrud(
                { requiredPermission: testPermission },
                orm.em.getMetadata().get("TestEntityWithDuplicateDefaultDecorator"),
            );
            const formattedOut = await formatGeneratedFiles(out);
            const file = formattedOut.find((file) => file.name === "dto/test-entity-with-duplicate-default-decorator.input.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);
            const classes = source.getClasses();
            const cls = classes[0];
            const structure = cls.getStructure();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const prop = structure.properties![0];
            expect(prop.name).toBe("name");

            const importDeclarations = source.getImportDeclarations();
            // check if import from class-validator exists only once
            const classValidatorImports = importDeclarations.filter(
                (getImportDeclaration) => getImportDeclaration.getModuleSpecifierValue() === "class-validator",
            );

            expect(classValidatorImports.length).toBe(1);

            // check if IsOptional and IsString are imported only once from class-validator
            const isOptionalImport = classValidatorImports[0].getNamedImports().filter((namedImport) => namedImport.getName() === "IsOptional");
            expect(isOptionalImport.length).toBe(1);

            const isStringImport = classValidatorImports[0].getNamedImports().filter((namedImport) => namedImport.getName() === "IsString");
            expect(isStringImport.length).toBe(1);

            orm.close();
        });
    });
});
