import type { ClassConstructor } from "class-transformer";

import type { BlockMigrationInterface, BlockMigrationTransformFn } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MigrationClass<T extends BlockMigrationTransformFn = any> = ClassConstructor<BlockMigrationInterface<T>>; // alias

// For type-safety
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
        MigrationClass<(arg: R11) => R12>,
        MigrationClass<(arg: R12) => R13>,
        MigrationClass<(arg: R13) => R14>,
        MigrationClass<(arg: R14) => R15>,
        MigrationClass<(arg: R15) => R16>,
        MigrationClass<(arg: R16) => R17>,
        MigrationClass<(arg: R17) => R18>,
        MigrationClass<(arg: R18) => R19>,
        MigrationClass<(arg: R19) => R20>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
        MigrationClass<(arg: R11) => R12>,
        MigrationClass<(arg: R12) => R13>,
        MigrationClass<(arg: R13) => R14>,
        MigrationClass<(arg: R14) => R15>,
        MigrationClass<(arg: R15) => R16>,
        MigrationClass<(arg: R16) => R17>,
        MigrationClass<(arg: R17) => R18>,
        MigrationClass<(arg: R18) => R19>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
        MigrationClass<(arg: R11) => R12>,
        MigrationClass<(arg: R12) => R13>,
        MigrationClass<(arg: R13) => R14>,
        MigrationClass<(arg: R14) => R15>,
        MigrationClass<(arg: R15) => R16>,
        MigrationClass<(arg: R16) => R17>,
        MigrationClass<(arg: R17) => R18>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
        MigrationClass<(arg: R11) => R12>,
        MigrationClass<(arg: R12) => R13>,
        MigrationClass<(arg: R13) => R14>,
        MigrationClass<(arg: R14) => R15>,
        MigrationClass<(arg: R15) => R16>,
        MigrationClass<(arg: R16) => R17>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
        MigrationClass<(arg: R11) => R12>,
        MigrationClass<(arg: R12) => R13>,
        MigrationClass<(arg: R13) => R14>,
        MigrationClass<(arg: R14) => R15>,
        MigrationClass<(arg: R15) => R16>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
        MigrationClass<(arg: R11) => R12>,
        MigrationClass<(arg: R12) => R13>,
        MigrationClass<(arg: R13) => R14>,
        MigrationClass<(arg: R14) => R15>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
        MigrationClass<(arg: R11) => R12>,
        MigrationClass<(arg: R12) => R13>,
        MigrationClass<(arg: R13) => R14>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
        MigrationClass<(arg: R11) => R12>,
        MigrationClass<(arg: R12) => R13>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
        MigrationClass<(arg: R11) => R12>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
        MigrationClass<(arg: R10) => R11>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
        MigrationClass<(arg: R9) => R10>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
        MigrationClass<(arg: R8) => R9>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7, R8>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
        MigrationClass<(arg: R7) => R8>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6, R7>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
        MigrationClass<(arg: R6) => R7>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5, R6>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
        MigrationClass<(arg: R5) => R6>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4, R5>(
    migrations: [
        MigrationClass<(arg: A1) => R1>,
        MigrationClass<(arg: R1) => R2>,
        MigrationClass<(arg: R2) => R3>,
        MigrationClass<(arg: R3) => R4>,
        MigrationClass<(arg: R4) => R5>,
    ],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3, R4>(
    migrations: [MigrationClass<(arg: A1) => R1>, MigrationClass<(arg: R1) => R2>, MigrationClass<(arg: R2) => R3>, MigrationClass<(arg: R3) => R4>],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2, R3>(
    migrations: [MigrationClass<(arg: A1) => R1>, MigrationClass<(arg: R1) => R2>, MigrationClass<(arg: R2) => R3>],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1, R2>(
    migrations: [MigrationClass<(arg: A1) => R1>, MigrationClass<(arg: R1) => R2>],
): typeof migrations;
export function typeSafeBlockMigrationPipe<A1, R1>(migrations: [MigrationClass<(arg: A1) => R1>]): typeof migrations;
export function typeSafeBlockMigrationPipe(migrations: MigrationClass[]): typeof migrations {
    // type-safety is limited to 20 Migrations
    return migrations;
}
