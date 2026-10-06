import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { registerDecorator, type ValidationArguments, ValidatorConstraint, type ValidatorConstraintInterface } from "class-validator";
import { basename, extname } from "path";

import { slugifyFilename } from "../../../file-utils/files.utils.js";
import type { UpdateFileInput } from "../../files/dto/file.input.js";
import type { UpdateDamFileArgs } from "../../files/dto/update-dam-file.args.js";
import { resolveFileEntity } from "../../files/entities/resolve-dam-entity.js";

export const HasValidFilename = () => {
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    return (object: Object, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            validator: HasValidFilenameConstraint,
        });
    };
};

interface HasValidFilenameValidationArguments extends ValidationArguments {
    object: UpdateDamFileArgs;
}

@ValidatorConstraint({ name: "HasValidFilename", async: true })
@Injectable()
export class HasValidFilenameConstraint implements ValidatorConstraintInterface {
    errorMessage: string | undefined;

    constructor(private readonly entityManager: EntityManager) {}

    async validate(value: UpdateFileInput, validationArguments: HasValidFilenameValidationArguments): Promise<boolean> {
        if (value.name === undefined) {
            return true;
        }

        const newFilename = value.name;
        const newExtension = extname(newFilename);
        const newBasename = basename(newFilename, newExtension);

        if (newExtension.length === 0) {
            this.errorMessage = `Filename ${newFilename} has no extension`;
            return false;
        }

        if (newFilename !== slugifyFilename(newBasename, newExtension)) {
            this.errorMessage = `Filename ${newFilename} contains invalid symbols`;
            return false;
        }

        const id = validationArguments.object.id;
        const file = await this.entityManager.findOneOrFail(resolveFileEntity(), { id });

        const oldExtension = extname(file.name);

        if (newExtension !== oldExtension) {
            this.errorMessage = `Extension cannot be changed. Previous extension: ${oldExtension}, new extension: ${newExtension}`;
            return false;
        }

        return true;
    }

    defaultMessage(): string {
        return this.errorMessage ?? "Invalid filename";
    }
}
