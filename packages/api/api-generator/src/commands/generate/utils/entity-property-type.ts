import { ArrayType, type EntityProperty, EnumArrayType, JsonType } from "@mikro-orm/postgresql";

/**
 * MikroORM v7 reports `array` as the property type for array properties and exposes the concrete implementation
 * via `customType`, so array properties have to be recognized by their custom type rather than by `prop.type`.
 */
export function isEnumArrayProp(prop: EntityProperty): boolean {
    return prop.customType instanceof EnumArrayType;
}

export function isArrayProp(prop: EntityProperty): boolean {
    return prop.customType instanceof ArrayType && !isEnumArrayProp(prop);
}

export function isJsonProp(prop: EntityProperty): boolean {
    return prop.customType instanceof JsonType;
}
