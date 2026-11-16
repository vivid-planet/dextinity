import { ArgsType, Field, ID } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsUUID, ValidateNested } from "class-validator";

import { HasValidFilename } from "../../common/decorators/has-valid-filename.decorator.js";
import { UpdateFileInput } from "./file.input.js";

@ArgsType()
export class UpdateDamFileArgs {
    @Field(() => ID)
    @IsUUID()
    id: string;

    @Field(() => UpdateFileInput)
    @Type(() => UpdateFileInput)
    @ValidateNested()
    @HasValidFilename()
    input: UpdateFileInput;
}
