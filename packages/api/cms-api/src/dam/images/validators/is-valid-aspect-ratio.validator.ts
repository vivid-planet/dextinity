import { Inject, Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

import { DamConfig } from "../../dam.config";
import { DAM_CONFIG } from "../../dam.constants";
import { FilesService } from "../../files/files.service";
import { ImageParams } from "../dto/image.params";
import { calculateInheritAspectRatio } from "../images.util";

export const IsValidImageAspectRatio = (validationOptions?: ValidationOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (object: Record<string, any>, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidImageAspectRatioConstraint,
            constraints: [],
        });
    };
};

@ValidatorConstraint({ name: "IsValidImageAspectRatio" })
@Injectable()
export class IsValidImageAspectRatioConstraint implements ValidatorConstraintInterface {
    constructor(
        @Inject(DAM_CONFIG) private readonly config: DamConfig,
        private readonly filesService: FilesService,
    ) {}

    async validate(value: number, validationArguments: ValidationArguments): Promise<boolean> {
        const params = validationArguments.object as ImageParams;

        for (const allowedAspectRatioString of this.config.allowedAspectRatios) {
            const [width, height] = allowedAspectRatioString.split("x").map(Number);
            const allowedAspectRatio = width / height;
            const expectedResizeHeight = Math.ceil(params.resizeWidth / allowedAspectRatio);

            if (value === expectedResizeHeight) {
                return true;
            }
        }

        const file = await this.filesService.findOneById(params.fileId);

        if (file == null || file.image == null) {
            return false;
        }

        const inheritAspectRatio = calculateInheritAspectRatio(file.image, params.cropArea ?? file.image.cropArea);
        const expectedResizeHeight = Math.ceil(params.resizeWidth / inheritAspectRatio);

        return value === expectedResizeHeight;
    }

    defaultMessage(): string {
        return `Aspect ratio is invalid`;
    }
}
