import { IsString, MaxLength } from "class-validator";

export class EmailContactSubscribeScope {
    @IsString()
    @MaxLength(64)
    domain: string;

    @IsString()
    @MaxLength(64)
    language: string;
}
