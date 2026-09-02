import { IsString, MaxLength } from "class-validator";

export class EmailContactSubscribeScope {
    [key: string]: string;

    @IsString()
    @MaxLength(64)
    domain: string;

    @IsString()
    @MaxLength(64)
    language: string;
}
