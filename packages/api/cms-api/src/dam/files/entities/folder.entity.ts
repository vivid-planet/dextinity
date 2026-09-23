import { Embedded, Entity, Index, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { ArrayType, BaseEntity, Cascade, OptionalProps } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { DamScopeInterface } from "../../types";
import { FileInterface } from "./file.entity";
import { resolveFileEntity, resolveFolderEntity } from "./resolve-dam-entity";

export interface FolderInterface extends BaseEntity {
    [OptionalProps]?:
        | "createdAt"
        | "updatedAt"
        | "archived"
        | "children"
        | "numberOfFiles"
        | "files"
        | "numberOfChildFolders"
        | "isInboxFromOtherScope";
    id: string;
    name: string;
    parent: FolderInterface | null;
    children: FolderInterface[];
    numberOfChildFolders: number;
    numberOfFiles: number;
    mpath: string[];
    archived: boolean;
    isInboxFromOtherScope: boolean;
    files: FileInterface[];
    createdAt: Date;
    updatedAt: Date;
    scope?: DamScopeInterface;
}

export function createFolderEntity({ Scope }: { Scope?: Type<DamScopeInterface> } = {}): Type<FolderInterface> {
    @Entity({ abstract: true })
    @ObjectType({ isAbstract: true })
    class FolderBase extends BaseEntity implements FolderInterface {
        [OptionalProps]?:
            | "createdAt"
            | "updatedAt"
            | "archived"
            | "children"
            | "numberOfFiles"
            | "files"
            | "numberOfChildFolders"
            | "isInboxFromOtherScope";

        @PrimaryKey({ columnType: "uuid" })
        @Field(() => ID)
        id: string = uuid();

        @Property({ columnType: "text" })
        @Field()
        name: string;

        @ManyToOne({
            entity: () => resolveFolderEntity(),
            inversedBy: (folder: FolderInterface) => folder.children,
            joinColumn: "parentId",
            nullable: true,
            cascade: [Cascade.ALL],
        })
        parent: FolderInterface | null;

        @OneToMany(() => resolveFolderEntity(), (folder: FolderInterface) => folder.parent)
        children: FolderInterface[];

        @Property({ persist: false })
        @Field(() => Int)
        numberOfChildFolders: number;

        @Property({ persist: false })
        @Field(() => Int)
        numberOfFiles: number;

        @Property({ columnType: "uuid[]", type: ArrayType })
        @Index()
        @Field(() => [ID])
        mpath: string[];

        @Property({ columnType: "boolean" })
        @Field()
        archived: boolean = false;

        @Property({ columnType: "boolean" })
        @Field()
        isInboxFromOtherScope: boolean = false;

        @OneToMany(() => resolveFileEntity(), (file: FileInterface) => file.folder)
        files: FileInterface[];

        @Property({ columnType: "timestamp with time zone" })
        @Field()
        createdAt: Date = new Date();

        @Property({
            columnType: "timestamp with time zone",
            onUpdate: () => new Date(),
        })
        @Field()
        updatedAt: Date = new Date();
    }

    if (Scope) {
        @Entity({ tableName: FOLDER_TABLE_NAME })
        @ObjectType("DamFolder")
        class DamFolder extends FolderBase {
            @Embedded(() => Scope)
            @Field(() => Scope)
            scope: typeof Scope;

            @Field(() => DamFolder, { nullable: true })
            parent: DamFolder | null;
        }
        return DamFolder;
    } else {
        @Entity({ tableName: FOLDER_TABLE_NAME })
        @ObjectType("DamFolder")
        class DamFolder extends FolderBase {
            @Field(() => DamFolder, { nullable: true })
            parent: DamFolder | null;
        }
        return DamFolder;
    }
}

export const FOLDER_TABLE_NAME = "DamFolder";
