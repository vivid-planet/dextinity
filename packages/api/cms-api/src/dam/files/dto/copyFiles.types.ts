import type { Type } from "@nestjs/common";
import { Field, ObjectType } from "@nestjs/graphql";

import type { FileInterface } from "../entities/file.entity.js";

export interface CopyFilesResponseInterface {
    mappedFiles: Array<MappedFileInterface>;
}

interface MappedFileInterface {
    rootFile: FileInterface;
    copy: FileInterface;
}

export function createCopyFilesResponseType({ File }: { File: Type<FileInterface> }) {
    @ObjectType()
    class CopyFilesResponse implements CopyFilesResponseInterface {
        @Field(() => [MappedFile])
        mappedFiles: Array<MappedFile>;
    }

    @ObjectType()
    class MappedFile implements MappedFileInterface {
        @Field(() => File)
        rootFile: FileInterface;

        @Field(() => File)
        copy: FileInterface;
    }

    return CopyFilesResponse;
}
