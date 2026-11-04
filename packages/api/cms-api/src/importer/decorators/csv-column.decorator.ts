import { Transform } from "class-transformer";
import { parse, parseISO } from "date-fns";

import type { ImporterInputClass } from "../importer-input.type";

export enum CsvColumnType {
    String = "String",
    Integer = "Integer",
    Float = "Float",
    Boolean = "Boolean",
    DateTime = "DateTime",
}

interface ParsingOptions {
    valueMapping?: ValueMapping;
    dateFormatString?: string;
    type?: CsvColumnType;
    transform?: (value: string) => unknown;
}
export interface ImportFieldMetadata extends ParsingOptions {
    key: string;
    fieldPath: string;
    fieldName: string | number;
}
interface ValueMapping {
    [key: string]: boolean;
}

const defaultValueMapping: Record<string, boolean> = { true: true, false: false };
const metadataKey = "fields";
/**
 * Decorator to define a CSV column for an entity property. It defines the mapping between csv column and entity property.
 * @param {string} fieldName The name/header of the column in the csv file.
 * @param {ParsingOptions} parsingOptions - {@link ParsingOptions} Parsing options for the CSV column.
 * -------------------
 * *ParsingOptions:*
 * @property {{@link valueMapping}} valueMapping - A map defining boolean value representations
 * @property {string} dateFormatString - date-fns format string for parsing this column
 */
export const CsvColumn = (fieldName: string | number, parsingOptions: Partial<ParsingOptions> = {}) => {
    const { valueMapping, dateFormatString, type, transform } = parsingOptions;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return function (target: any, key: string) {
        const fields =
            Reflect.getOwnMetadata(metadataKey, target.constructor) || (Reflect.getMetadata(metadataKey, target.constructor) || []).slice(0);
        fields.push({ key, fieldPath: key, fieldName, valueMapping, dateFormatString, type });
        Reflect.defineMetadata(metadataKey, fields, target.constructor);

        Transform(({ value }) => {
            if (transform) {
                return transform(value);
            }
            if (type === CsvColumnType.Boolean) {
                const valueMapping = parsingOptions.valueMapping || defaultValueMapping;
                return valueMapping[value];
            }
            if (type === CsvColumnType.Integer) {
                return parseInt(value);
            }
            if (type === CsvColumnType.Float) {
                return parseFloat(value);
            }
            if (type === CsvColumnType.DateTime) {
                if (dateFormatString) {
                    return parse(value, dateFormatString, new Date());
                } else {
                    return parseISO(value);
                }
            }
            return value;
        })(target, key);
    };
};
export const getFieldMetadata = (entity: ImporterInputClass) => {
    return Reflect.getOwnMetadata(metadataKey, entity) as ImportFieldMetadata[];
};
