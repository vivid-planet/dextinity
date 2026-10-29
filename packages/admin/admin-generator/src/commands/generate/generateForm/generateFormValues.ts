import type { IntrospectionObjectType, IntrospectionQuery } from "graphql";

import type { GenerateFieldsReturn } from "./generateFields";

type FormValuesConfigTreeNode = {
    config?: GenerateFieldsReturn["formValuesConfig"][0];
    nullable?: boolean;
    children: FormValuesConfigTree;
};
type FormValuesConfigTree = {
    [key: string]: FormValuesConfigTreeNode;
};

// internal represenstation of formValuesConfig as tree to allow recursive processing
export function formValuesConfigToTree({
    formValuesConfig,
    gqlIntrospection,
    gqlType,
}: {
    formValuesConfig: GenerateFieldsReturn["formValuesConfig"];
    gqlIntrospection: IntrospectionQuery;
    gqlType: string;
}): FormValuesConfigTree {
    const treeRoot: FormValuesConfigTreeNode = { children: {} };
    for (const formValueConfig of formValuesConfig) {
        const fieldName = formValueConfig.fieldName;
        let currentTreeNode: FormValuesConfigTreeNode = treeRoot;
        let currentGqlType = gqlType;
        for (const part of fieldName.split(".")) {
            const introspectionObject = gqlIntrospection.__schema.types.find((type) => type.kind === "OBJECT" && type.name === currentGqlType) as
                IntrospectionObjectType | undefined;
            if (!introspectionObject) {
                throw new Error(`didn't find object ${gqlType} in gql introspection`);
            }

            const introspectionField = (introspectionObject as IntrospectionObjectType).fields.find((field) => field.name === part);

            const introspectionFieldType = introspectionField
                ? introspectionField.type.kind === "NON_NULL"
                    ? introspectionField.type.ofType
                    : introspectionField.type
                : undefined;
            if (introspectionFieldType?.kind === "OBJECT") {
                // for next loop iteration (nested fields)
                currentGqlType = introspectionFieldType.name;
            }

            if (!currentTreeNode.children[part]) {
                currentTreeNode.children[part] = { children: {} };
            }

            currentTreeNode.children[part].nullable = introspectionField?.type.kind !== "NON_NULL";
            currentTreeNode = currentTreeNode.children[part];
        }
        currentTreeNode.config = formValueConfig;
    }
    return treeRoot.children;
}

function generateFormValuesTypeFromTree(tree: FormValuesConfigTree, currentTypeName: string, currentIsNullable: boolean): string {
    const omitKeys: string[] = [];
    let appendCode = "";
    for (const [key, value] of Object.entries(tree)) {
        if (Object.keys(value.children).length > 0) {
            let childRootType = `${currentTypeName}["${key}"]`;
            if (currentIsNullable) {
                childRootType = `NonNullable<${currentTypeName}>["${key}"]`;
            }
            const childOmit = generateFormValuesTypeFromTree(value.children, childRootType, value.nullable ?? false);
            if (childOmit !== childRootType) {
                appendCode += `${key}: ${childOmit}`;
                omitKeys.push(key);
            }
            if (value.config?.typeCode) {
                throw new Error("Field has both subfields and direct typeCode, which is not supported.");
            }
            if (value.config?.omitFromFragmentType) {
                throw new Error("Field has both subfields and direct omitFromFragmentType, which is not supported.");
            }
        } else if (value.config) {
            if (value.config.typeCode) {
                appendCode += `${key}${value.config.typeCode.nullable ? "?" : ""}: ${value.config.typeCode.type}; `;
            }
            if (value.config.omitFromFragmentType) {
                omitKeys.push(key);
            }
        }
    }

    let code = omitKeys.length
        ? `Omit<${currentIsNullable ? `NonNullable<` : ""}${currentTypeName}${currentIsNullable ? `>` : ""}, ${omitKeys.map((k) => `"${k}"`).join(" | ")}>`
        : currentTypeName;
    if (appendCode.length) {
        code += ` & { ${appendCode} }`;
    }
    return code;
}

export function generateFormValuesType({
    formValuesConfig,
    filterByFragmentType,
    gqlIntrospection,
    gqlType,
}: {
    formValuesConfig: GenerateFieldsReturn["formValuesConfig"];
    filterByFragmentType: string;
    gqlIntrospection: IntrospectionQuery;
    gqlType: string;
}) {
    const tree = formValuesConfigToTree({ formValuesConfig, gqlIntrospection, gqlType });
    return `type FormValues = ${generateFormValuesTypeFromTree(tree, filterByFragmentType, false)};`;
}

function generateInitialValuesFromTree(
    tree: FormValuesConfigTree,
    dataObject: string | null,
    generationType: "initializationCode" | "defaultInitializationCode",
): string {
    let code = "";
    for (const [key, value] of Object.entries(tree)) {
        if (Object.keys(value.children).length > 0) {
            let childCode = generateInitialValuesFromTree(value.children, dataObject ? `${dataObject}.${key}` : null, generationType);
            if (childCode.length) {
                if (dataObject) {
                    childCode = `{ ...${dataObject}.${key}, ${childCode} }`;
                    if (value.nullable) {
                        code += `${key}: ${dataObject}.${key} ? ${childCode} : undefined, `;
                    } else {
                        code += `${key}: ${childCode}, `;
                    }
                } else {
                    code += `${key}: { ${childCode} }, `;
                }
            }
            if (value.config?.[generationType]) {
                throw new Error("Field has both subfields and direct initialization code, which is not supported.");
            }
        } else if (value.config) {
            if (value.config[generationType]) {
                code += `${key}: ${value.config[generationType]}, `;
            }
        }
    }
    return code;
}

export function generateInitialValues({
    mode,
    formValuesConfig,
    filterByFragmentType,
    gqlIntrospection,
    gqlType,
    initialValuesAsProp,
}: {
    mode: "all" | "edit" | "add";
    formValuesConfig: GenerateFieldsReturn["formValuesConfig"];
    filterByFragmentType: string;
    gqlIntrospection: IntrospectionQuery;
    gqlType: string;
    initialValuesAsProp: boolean;
}) {
    const instanceGqlType = gqlType[0].toLowerCase() + gqlType.substring(1);

    const editMode = mode === "edit" || mode == "all";

    const tree = formValuesConfigToTree({ formValuesConfig, gqlIntrospection, gqlType });
    if (editMode) {
        return `const initialValues = useMemo<Partial<FormValues>>(() => data?.${instanceGqlType}
            ? {
                ...filterByFragment<${filterByFragmentType}>(${instanceGqlType}FormFragment, data.${instanceGqlType}),
                ${generateInitialValuesFromTree(tree, `data.${instanceGqlType}`, "initializationCode")}
            }
            : {
                ${generateInitialValuesFromTree(tree, initialValuesAsProp ? `passedInitialValues` : null, "defaultInitializationCode")}
                ${initialValuesAsProp ? `...passedInitialValues,` : ""}
            }
        , [data]);`;
    } else {
        return `const initialValues = {
            ${generateInitialValuesFromTree(tree, initialValuesAsProp ? `passedInitialValues` : null, "defaultInitializationCode")}
            ${initialValuesAsProp ? `...passedInitialValues,` : ""}
        };`;
    }
}

function generateDestructFormValueForInputFromTree(tree: FormValuesConfigTree, restObject: string): string {
    let code = "";
    for (const [key, value] of Object.entries(tree)) {
        if (Object.keys(value.children).length > 0) {
            const childCode = generateDestructFormValueForInputFromTree(
                value.children,
                `${restObject}${key.substring(0, 1).toUpperCase()}${key.substring(1)}`,
            );
            if (childCode.length) {
                code += `${key}: { ${childCode} }, `;
            }
        } else if (value.config) {
            if (value.config.destructFromFormValues) {
                code += `${key}, `;
            }
        }
    }
    if (code.length) {
        code += `...${restObject}Rest`;
        return code;
    } else {
        return "";
    }
}

export function generateDestructFormValueForInput({
    formValuesConfig,
    gqlIntrospection,
    gqlType,
}: {
    formValuesConfig: GenerateFieldsReturn["formValuesConfig"];
    gqlIntrospection: IntrospectionQuery;
    gqlType: string;
}) {
    const tree = formValuesConfigToTree({ formValuesConfig, gqlIntrospection, gqlType });
    const code = generateDestructFormValueForInputFromTree(tree, "formValues");
    return code.length ? `{ ${code} }` : "formValues";
}

function generateFormValuesToGqlInputFromTree(tree: FormValuesConfigTree, dataObject: string, restObject: string): string {
    let code = "";
    for (const [key, value] of Object.entries(tree)) {
        if (Object.keys(value.children).length > 0) {
            const childRestObject = `${restObject.replace(/Rest$/, "")}${key.substring(0, 1).toUpperCase()}${key.substring(1)}Rest`;
            const hasChildDestruct = hasChildDestructTree(value.children);
            let childCode = generateFormValuesToGqlInputFromTree(
                value.children,
                hasChildDestruct ? childRestObject : `${dataObject}.${key}`,
                childRestObject,
            );
            if (childCode.length || hasChildDestruct) {
                childCode = `{ ...${hasChildDestruct ? childRestObject : `${dataObject}.${key}`}, ${childCode} }`;
                if (value.config?.wrapFormValueToGqlInputCode) {
                    childCode = value.config.wrapFormValueToGqlInputCode
                        .replaceAll("$fieldName", `${dataObject}.${key}`)
                        .replaceAll("$inner", childCode);
                }
                code += `${key}: ${childCode}, `;
            }
            if (value.config?.formValueToGqlInputCode) {
                throw new Error("Field has both subfields and direct formValueToGqlInputCode, which is not supported.");
            }
        } else if (value.config) {
            if (value.config.formValueToGqlInputCode) {
                code += `${key}: ${value.config.formValueToGqlInputCode.replaceAll("$fieldName", `${dataObject}.${key}`)}, `;
            }
        }
    }
    return code;
}

function hasChildDestructTree(tree: FormValuesConfigTree): boolean {
    return Object.values(tree).some((childValue) => {
        if (childValue.config?.destructFromFormValues) {
            return true;
        }
        if (Object.keys(childValue.children).length > 0) {
            return hasChildDestructTree(childValue.children);
        }
        return false;
    });
}

export function generateFormValuesToGqlInput({
    formValuesConfig,
    gqlIntrospection,
    gqlType,
}: {
    formValuesConfig: GenerateFieldsReturn["formValuesConfig"];
    gqlIntrospection: IntrospectionQuery;
    gqlType: string;
}) {
    const tree = formValuesConfigToTree({ formValuesConfig, gqlIntrospection, gqlType });
    const hasChildDestruct = hasChildDestructTree(tree);
    const code = generateFormValuesToGqlInputFromTree(
        tree,
        hasChildDestruct ? "formValuesRest" : "formValues",
        hasChildDestruct ? "formValuesRest" : "formValues",
    );
    if (code.length) {
        return `const output = { ...${hasChildDestruct ? "formValuesRest" : "formValues"}, ${code} };`;
    } else if (hasChildDestruct) {
        return `const output = formValuesRest;`;
    } else {
        return `const output = formValues;`;
    }
}
