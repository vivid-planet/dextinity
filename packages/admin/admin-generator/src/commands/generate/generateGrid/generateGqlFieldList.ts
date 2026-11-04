import objectPath from "object-path";

import type { GridConfig } from "../generate-command";

type FieldsObjectType = { [key: string]: FieldsObjectType | boolean | string };
const recursiveStringify = (obj: FieldsObjectType): string => {
    let ret = "";
    let prefixField = "";
    for (const key in obj) {
        const valueForKey = obj[key];
        if (typeof valueForKey === "boolean") {
            ret += `${prefixField}${key}`;
        } else if (typeof valueForKey === "string") {
            ret += `${prefixField}${key}${valueForKey}`;
        } else {
            ret += `${prefixField}${key} { ${recursiveStringify(valueForKey)} }`;
        }
        prefixField = " ";
    }
    return ret;
};

export function generateGqlFieldList<T extends { __typename?: string }>({ columns }: { columns: GridConfig<T>["columns"] }) {
    const fieldsObject: FieldsObjectType = columns.reduce<FieldsObjectType>((acc, field) => {
        if (field.type === "actions") {
            field.queryFields?.forEach((queryField) => {
                objectPath.set(acc, queryField, true);
            });
        } else if (field.name === "id") {
            // exclude id because it's always required
        } else {
            let hasCustomFields = false;

            if ("labelField" in field && field.labelField) {
                objectPath.set(acc, `${field.name}.${field.labelField}`, true);
                hasCustomFields = true;
            }

            if ("queryFields" in field) {
                field.queryFields?.forEach((queryField) => {
                    objectPath.set(acc, queryField, true);
                });
                hasCustomFields = true;
            }

            if (!hasCustomFields) {
                objectPath.set(acc, field.name, true);
            }
        }
        return acc;
    }, {});
    return recursiveStringify(fieldsObject);
}
