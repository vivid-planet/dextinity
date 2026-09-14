import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { basename, extname } from "path";

import { slugifyFilename } from "../../../file-utils/files.utils";
import { UpdateFileInput } from "../../files/dto/file.input";
import { UpdateDamFileArgs } from "../../files/dto/update-dam-file.args";
import { FILE_ENTITY, FileInterface } from "../../files/entities/file.entity";

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

    constructor(@InjectRepository(FILE_ENTITY) private readonly filesRepository: EntityRepository<FileInterface>) {}

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
        const file = await this.filesRepository.findOneOrFail({ id });

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
