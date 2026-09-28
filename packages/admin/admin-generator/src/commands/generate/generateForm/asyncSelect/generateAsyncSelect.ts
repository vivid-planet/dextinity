import type { IntrospectionInputValue, IntrospectionObjectType, IntrospectionQuery } from "graphql";

import { type FormConfig, type FormFieldConfig, isFormFieldConfig } from "../../generate-command";
import { findQueryTypeOrThrow } from "../../utils/findQueryType";
import { generateGqlOperation } from "../../utils/generateGqlOperation";
import type { Imports } from "../../utils/generateImportsCode";
import { isFieldOptional } from "../../utils/isFieldOptional";
import { buildFormFieldOptions } from "../formField/options";
import { findFieldByName, type GenerateFieldsReturn } from "../generateFields";
import type { Prop } from "../generateForm";

function gqlScalarToTypescriptType(scalarName: string): string {
    if (scalarName === "String" || scalarName === "ID" || scalarName === "DateTime" || scalarName === "LocalDate" || scalarName === "Date") {
        return "string";
    } else if (scalarName === "Boolean") {
        return "boolean";
    } else if (scalarName === "Int" || scalarName === "Float") {
        return "number";
    } else if (scalarName === "JSONObject") {
        return "unknown";
    } else {
        return "unknown";
    }
}

function buildTypeInfo(arg: IntrospectionInputValue, gqlIntrospection: IntrospectionQuery) {
    let typeKind = undefined;
    let typeClass = "unknown";
    let required = false;
    let type = arg.type;
    let inputType = undefined;

    if (type.kind === "NON_NULL") {
        required = true;
        type = type.ofType;
    }
    if (type.kind === "INPUT_OBJECT") {
        typeClass = type.name;
        typeKind = type.kind;
        inputType = gqlIntrospection.__schema.types.find((type) => type.name === typeClass);
    } else if (type.kind === "ENUM") {
        typeClass = type.name;
        typeKind = type.kind;
    } else if (type.kind === "SCALAR") {
        typeClass = type.name;
        typeKind = type.kind;
    } else {
        throw new Error(`getTypeInfo: Resolving kind ${type.kind} currently not supported.`);
    }
    return {
        required,
        typeKind,
        typeClass,
        inputType,
    };
}

/**
 * Helper that returns the introspection object type for a given form field config, supporting the special case for asyncSelectFilter
 */
export function findIntrospectionObjectType({
    config,
    gqlIntrospection,
    gqlType,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: FormFieldConfig<any>;
    gqlIntrospection: IntrospectionQuery;
    gqlType: string;
}) {
    const name = String(config.name);

    const introspectionObject = gqlIntrospection.__schema.types.find((type) => type.kind === "OBJECT" && type.name === gqlType) as
        | IntrospectionObjectType
        | undefined;
    if (!introspectionObject) {
        throw new Error(`didn't find object ${gqlType} in gql introspection`);
    }

    function findIntrospectionField(introspectionObject: IntrospectionObjectType, name: string) {
        const introspectionField = introspectionObject.fields.find((field) => field.name === name);
        if (!introspectionField) {
            throw new Error(`didn't find field ${name} in gql introspection type ${gqlType}`);
        }
        let introspectionFieldType = introspectionField.type.kind === "NON_NULL" ? introspectionField.type.ofType : introspectionField.type;

        const multiple = introspectionFieldType?.kind === "LIST";
        if (introspectionFieldType?.kind === "LIST") {
            introspectionFieldType =
                introspectionFieldType.ofType.kind === "NON_NULL" ? introspectionFieldType.ofType.ofType : introspectionFieldType.ofType;
        }

        if (introspectionFieldType.kind !== "OBJECT") {
            throw new Error(`asyncSelect only supports OBJECT types`);
        }
        const objectType = gqlIntrospection.__schema.types.find((t) => t.kind === "OBJECT" && t.name === introspectionFieldType.name) as
            | IntrospectionObjectType
            | undefined;
        if (!objectType) {
            throw new Error(`Object type ${introspectionFieldType.name} not found for field ${name}`);
        }
        return { multiple, objectType };
    }
    if (config.type === "asyncSelectFilter") {
        //for a filter select the field is "virtual", and it's ObjectType is defined by the path in config.loadValueQueryField
        return {
            multiple: false,
            objectType: config.loadValueQueryField.split(".").reduce((acc, fieldName) => {
                const introspectionField = findIntrospectionField(acc, fieldName);
                if (introspectionField.multiple) {
                    throw new Error(`asyncSelectFilter does not support list fields in loadValueQueryField`);
                }
                return introspectionField.objectType;
            }, introspectionObject),
        };
    } else {
        //for a standard select we follow the nested path (if any) to find the final object type
        const nameParts = name.split(".");
        const lastPart = nameParts[nameParts.length - 1];
        const resolvedObject = nameParts.slice(0, -1).reduce((acc, fieldName) => {
            const introspectionField = findIntrospectionField(acc, fieldName);
            if (introspectionField.multiple) {
                throw new Error(`asyncSelect does not support list fields in nested path`);
            }
            return introspectionField.objectType;
        }, introspectionObject);
        return findIntrospectionField(resolvedObject, lastPart);
    }
}

export function generateAsyncSelect({
    gqlIntrospection,
    baseOutputFilename,
    config,
    formConfig,
    gqlType,
    namePrefix,
}: {
    gqlIntrospection: IntrospectionQuery;
    baseOutputFilename: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: Extract<FormFieldConfig<any>, { type: "asyncSelect" } | { type: "asyncSelectFilter" }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formConfig: FormConfig<any>;
    gqlType: string;
    namePrefix?: string;
}): GenerateFieldsReturn {
    const imports: Imports = [];
    const formProps: Prop[] = [];

    const {
        name,
        fieldLabel,
        startAdornment,
        //endAdornment,
        imports: optionsImports,
    } = buildFormFieldOptions({ config, formConfig });
    imports.push(...optionsImports);

    const nameWithPrefix = `${namePrefix ? `${namePrefix}.` : ``}${name}`;

    const required = !isFieldOptional({ config, gqlIntrospection, gqlType });

    const formValueConfig: GenerateFieldsReturn["formValuesConfig"][0] = {
        fieldName: name,
        destructFromFormValues: config.type == "asyncSelectFilter",
    };

    let finalFormConfig: GenerateFieldsReturn["finalFormConfig"];
    let code = "";

    const { objectType, multiple } = findIntrospectionObjectType({
        config,
        gqlIntrospection,
        gqlType,
    });

    //find labelField: 1. as configured
    let labelField = config.labelField;

    //find labelField: 2. common names (name or title)
    if (!labelField) {
        labelField = objectType.fields.find((field) => {
            let type = field.type;
            if (type.kind == "NON_NULL") {
                type = type.ofType;
            }
            if ((field.name == "name" || field.name == "title") && type.kind == "SCALAR" && type.name == "String") {
                return true;
            }
        })?.name;
    }

    //find labelField: 3. first string field
    if (!labelField) {
        labelField = objectType.fields.find((field) => {
            let type = field.type;
            if (type.kind == "NON_NULL") {
                type = type.ofType;
            }
            if (field.type.kind == "SCALAR" && field.type.name == "String") {
                return true;
            }
        })?.name;
    }

    const rootQuery = config.rootQuery; //TODO we should infer a default value from the gql schema
    const queryName = `${rootQuery[0].toUpperCase() + rootQuery.substring(1)}Select`;
    const rootQueryType = findQueryTypeOrThrow(rootQuery, gqlIntrospection);

    let formFragmentFields: string[];
    if (config.type == "asyncSelectFilter") {
        formFragmentFields = [`${config.loadValueQueryField}.id`, `${config.loadValueQueryField}.${labelField}`];
    } else {
        formFragmentFields = [`${name}.id`, `${name}.${labelField}`];
    }

    const rootQueryHasSearchArg = rootQueryType.args.find((arg) => arg.name === "search");
    const useAutocomplete = config.autocomplete ?? !!rootQueryHasSearchArg;
    if (useAutocomplete) {
        if (!rootQueryHasSearchArg) {
            throw new Error(`Field ${String(config.name)}: Autocomplete is enabled but root query "${rootQuery}" has no search argument.`);
        }
        if (rootQueryHasSearchArg.type.kind !== "SCALAR" || rootQueryHasSearchArg.type.name !== "String") {
            throw new Error(
                `Field ${String(config.name)}: Autocomplete is enabled but root query "${rootQuery}" has search argument that is not a string.`,
            );
        }
    }

    const filterConfig = config.filter
        ? (() => {
              let filterField: FormFieldConfig<unknown> | undefined;
              let rootQueryArg = config.filter.rootQueryArg;
              let filterVar = "";

              if (config.filter.type === "field") {
                  filterField = findFieldByName(config.filter.formFieldName, formConfig.fields);
                  if (!filterField) {
                      throw new Error(
                          `Field ${String(config.name)}: No field with name "${
                              config.filter.formFieldName
                          }" referenced as filter.formFieldName found in form-config.`,
                      );
                  }
                  if (!isFormFieldConfig(filterField)) {
                      throw new Error(
                          `Field ${String(config.name)}: Field with name "${config.filter.formFieldName}" referenced as filter.formFieldName is no FormField.`,
                      );
                  }

                  filterVar = `values.${filterField.type === "asyncSelect" || filterField.type === "asyncSelectFilter" ? `${String(filterField.name)}?.id` : String(filterField.name)}`;

                  if (!rootQueryArg) {
                      rootQueryArg = config.filter.formFieldName;
                  }
              } else if (config.filter.type === "formProp") {
                  filterVar = config.filter.propName;
                  if (!rootQueryArg) {
                      rootQueryArg = config.filter.propName;
                  }
              } else {
                  throw new Error("unsupported filter type");
              }

              // try to find arg used to filter by checking names of root-arg and filter-arg-fields
              const rootArgForName = rootQueryType.args.find((arg) => arg.name === rootQueryArg);
              let filterType = rootArgForName ? buildTypeInfo(rootArgForName, gqlIntrospection) : undefined;
              let filterVarName = undefined;
              let filterVarValue = undefined;

              let filterVarType = "unknown";

              if (filterType) {
                  // there is a query root arg with same name, filter using it
                  filterVarName = rootQueryArg;
                  filterVarValue = filterVar;
                  if (filterType.typeKind === "INPUT_OBJECT" || filterType.typeKind === "ENUM") {
                      filterVarType = `GQL${filterType.typeClass}`;
                      imports.push({
                          name: filterVarType,
                          importPath: "@src/graphql.generated",
                      });
                  } else if (filterType.typeKind === "SCALAR") {
                      filterVarType = gqlScalarToTypescriptType(filterType.typeClass);
                  }
              } else {
                  // no root-arg with same name, check filter-arg-fields
                  const rootArgFilter = rootQueryType.args.find((arg) => arg.name === "filter");
                  filterType = rootArgFilter ? buildTypeInfo(rootArgFilter, gqlIntrospection) : undefined;
                  if (filterType) {
                      filterVarName = "filter";
                      filterVarValue = `{ ${rootQueryArg}: { equal: ${filterVar} } }`;
                      // get type of field.equal in filter-arg used for filtering
                      if (filterType.inputType?.kind !== "INPUT_OBJECT") {
                          throw new Error(`Field ${String(config.name)}: Type of filter is no object-type.`);
                      }
                      const nestedFilterInput = filterType.inputType.inputFields.find((inputField) => inputField.name === rootQueryArg);
                      if (!nestedFilterInput) {
                          throw new Error(`Field ${String(config.name)}: Field filter.${rootQueryArg} does not exist`);
                      }
                      const gqlFilterInputType = buildTypeInfo(nestedFilterInput, gqlIntrospection);
                      if (!gqlFilterInputType?.inputType || gqlFilterInputType.inputType.kind !== "INPUT_OBJECT") {
                          throw new Error(
                              `Field ${String(config.name)}: Type of filter.${rootQueryArg} is no object-type, but needs to be e.g. StringFilter-type.`,
                          );
                      }
                      const gqlFilterEqualInputType = gqlFilterInputType.inputType.inputFields.find((inputField) => inputField.name === "equal");
                      if (!gqlFilterEqualInputType) {
                          throw new Error(`Field ${String(config.name)}: Field filter.${rootQueryArg}.equal does not exist`);
                      }
                      const equalFieldType = buildTypeInfo(gqlFilterEqualInputType, gqlIntrospection);
                      if (!equalFieldType) {
                          throw new Error(
                              `Field ${String(config.name)}: Field filter.${rootQueryArg}.equal does not exist but is required for filtering.`,
                          );
                      }
                      if (equalFieldType.typeKind === "INPUT_OBJECT" || equalFieldType.typeKind === "ENUM") {
                          filterVarType = `GQL${equalFieldType.typeClass}`;
                          imports.push({
                              name: filterVarType,
                              importPath: "@src/graphql.generated",
                          });
                      } else if (equalFieldType.typeKind === "SCALAR") {
                          filterVarType = gqlScalarToTypescriptType(equalFieldType.typeClass);
                      }
                  } else {
                      throw new Error(
                          `Neither filter-prop nor root-prop with name: ${rootQueryArg} for asyncSelect-query not found. Consider setting filterField.gqlVarName explicitly.`,
                      );
                  }
              }
              if (config.filter.type === "formProp") {
                  formProps.push({
                      name: config.filter.propName,
                      optional: false,
                      type: filterVarType,
                  });
              }

              return {
                  filterField,
                  filterType,
                  filterVarName,
                  filterVarValue,
              };
          })()
        : undefined;
    if (filterConfig) {
        imports.push({ name: "OnChangeField", importPath: "@dextinity/admin" });
        finalFormConfig = { subscription: { values: true }, renderProps: { values: true, form: true } };
    }

    if (config.type != "asyncSelectFilter") {
        if (!multiple) {
            if (!required) {
                formValueConfig.formValueToGqlInputCode = `$fieldName ? $fieldName.id : null`;
            } else {
                formValueConfig.formValueToGqlInputCode = `$fieldName?.id`;
            }
        } else {
            formValueConfig.formValueToGqlInputCode = `$fieldName.map((item) => item.id)`;
        }
    }

    imports.push({
        name: `GQL${queryName}Query`,
        importPath: `./${baseOutputFilename}.generated`,
    });
    imports.push({
        name: `GQL${queryName}QueryVariables`,
        importPath: `./${baseOutputFilename}.generated`,
    });
    if (useAutocomplete) {
        imports.push({ name: "AsyncAutocompleteField", importPath: "@dextinity/admin" });
    } else {
        imports.push({ name: "AsyncSelectField", importPath: "@dextinity/admin" });
    }

    const instanceGqlType = gqlType[0].toLowerCase() + gqlType.substring(1);

    if (config.type == "asyncSelectFilter") {
        // add (in the gql schema) non existing value for virtual filter field
        formValueConfig.typeCode = { nullable: true, type: `{ id: string; ${labelField}: string }` };
        formValueConfig.initializationCode = `data.${instanceGqlType}.${config.loadValueQueryField.replace(/\./g, "?.")}`;
    }

    code = `<${useAutocomplete ? "AsyncAutocompleteField" : "AsyncSelectField"}
                ${required ? "required" : ""}
                variant="horizontal"
                fullWidth
                ${config.readOnly ? "readOnly disabled" : ""}
                ${multiple ? "multiple" : ""}
                name="${nameWithPrefix}"
                label={${fieldLabel}}
                ${config.startAdornment ? `startAdornment={<InputAdornment position="start">${startAdornment.adornmentString}</InputAdornment>}` : ""}
                loadOptions={async (${useAutocomplete ? `search?: string` : ""}) => {
                    const { data } = await client.query<GQL${queryName}Query, GQL${queryName}QueryVariables>({
                        query: gql\`${generateGqlOperation({
                            type: "query",
                            operationName: queryName,
                            rootOperation: rootQuery,
                            fields: ["nodes.id", `nodes.${labelField}`],
                            variables: [
                                useAutocomplete ? { name: "search", type: "String" } : undefined,
                                filterConfig
                                    ? {
                                          name: filterConfig.filterVarName,
                                          type: filterConfig.filterType.typeClass + (filterConfig.filterType.required ? `!` : ``),
                                      }
                                    : undefined,
                            ].filter((v) => v !== undefined),
                        })}\`${filterConfig || useAutocomplete ? ", variables: { " : ""}
                            ${filterConfig ? `${filterConfig.filterVarName}: ${filterConfig.filterVarValue},` : ``}
                            ${useAutocomplete ? `search,` : ``}
                        ${filterConfig || useAutocomplete ? " }" : ""}
                    });
                    return data.${rootQuery}.nodes;
                }}
                getOptionLabel={(option) => option.${labelField}}
                ${filterConfig?.filterField ? `disabled={!values?.${String(filterConfig.filterField.name)}}` : ``}
            />${
                filterConfig?.filterField
                    ? `<OnChangeField name="${String(filterConfig.filterField.name)}">
                            {(value, previousValue) => {
                                if (value.id !== previousValue.id) {
                                    form.change("${String(config.name)}", undefined);
                                }
                            }}
                        </OnChangeField>`
                    : ``
            }`;

    return {
        code,
        hooksCode: "",
        formFragmentFields,
        gqlDocuments: {},
        imports,
        formProps,
        formValuesConfig: [formValueConfig],
        finalFormConfig,
    };
}
