import { Injectable } from "@nestjs/common";
import { isString, registerDecorator, ValidatorConstraint, type ValidatorConstraintInterface } from "class-validator";

export const IsValidYouTubeIdentifier = () => {
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    return (object: Object, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            validator: IsValidYouTubeIdentifierConstraint,
        });
    };
};

const EXPECTED_YT_ID_LENGTH = 11;

@ValidatorConstraint({ name: "IsValidYoutubeIdentifier" })
@Injectable()
class IsValidYouTubeIdentifierConstraint implements ValidatorConstraintInterface {
    validate(value: unknown): boolean {
        if (!isString(value)) {
            return false;
        }

        // copy of cms-admin/src/blocks/YouTubeVideoBlock.tsx
        // regex from https://stackoverflow.com/a/51870158
        const regExp =
            /(https?:\/\/)?(((m|www)\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([_0-9a-zA-Z-]+)/;
        const match = value.match(regExp);
        return value.length === EXPECTED_YT_ID_LENGTH || (!!match && match[8].length == EXPECTED_YT_ID_LENGTH);
    }

    defaultMessage(): string {
        return "Invalid YouTube identifier";
    }
}
