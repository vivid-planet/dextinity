import type { IntrospectionField, IntrospectionQuery } from "graphql";

import { type FormConfig, type GeneratorReturn, type GQLDocumentConfigMap, isFormFieldConfig, isFormLayoutConfig } from "../generate-command";
import { convertConfigImport } from "../utils/convertConfigImport";
import { findMutationTypeOrThrow } from "../utils/findMutationType";
import { generateGqlOperation } from "../utils/generateGqlOperation";
import { generateImportsCode, type Imports } from "../utils/generateImportsCode";
import { isGeneratorConfigImport } from "../utils/runtimeTypeGuards";
import { extractErrorEnumsFromMutations } from "./extractErrorEnums";
import { flatFormFieldsFromFormConfig } from "./flatFormFieldsFromFormConfig";
import { generateErrorHandlingCode } from "./generateErrorHandling";
import { generateErrorMessagesCode } from "./generateErrorMessages";
import { generateFields, type GenerateFieldsReturn } from "./generateFields";
import { generateDestructFormValueForInput, generateFormValuesToGqlInput, generateFormValuesType, generateInitialValues } from "./generateFormValues";
import { generateFragmentByFormFragmentFields } from "./generateFragmentByFormFragmentFields";
import { getForwardedGqlArgs, type GqlArg } from "./getForwardedGqlArgs";

/**
 * Detects if a mutation has a wrapped payload response type (e.g., CreateProductPayload with product and errors fields)
 * vs returning the entity directly.
 */
function hasPayloadResponseType(mutationField: IntrospectionField, gqlType: string): boolean {
    let returnType = mutationField.type;
    if (returnType.kind === "NON_NULL") {
        returnType = returnType.ofType;
    }

    if (returnType.kind === "OBJECT" && returnType.name === gqlType) {
        return false;
    } else {
        return true;
    }
}

export type Prop = { type: string; optional: boolean; name: string; localAliasName?: string };
function generateFormPropsCode(props: Prop[]): { formPropsTypeCode: string; formPropsParamsCode: string } {
    if (!props.length) {
        return { formPropsTypeCode: "", formPropsParamsCode: "" };
    }

    const uniqueProps = props.reduce<Prop[]>((acc, item) => {
        const propWithSameName = acc.find((prop) => prop.name == item.name);
        if (!propWithSameName) {
            return [item, ...acc];
        }
        if (propWithSameName.type != item.type || propWithSameName.optional != item.optional) {
            // this is currently not supported
            return [item, ...acc];
        }
        return acc;
    }, []);

    return {
        formPropsTypeCode: `interface FormProps {
            ${uniqueProps.map((prop) => `${prop.name}${prop.optional ? `?` : ``}: ${prop.type};`).join("\n")}
        }`,
        formPropsParamsCode: `{${uniqueProps.map((prop) => prop.name + (prop.localAliasName ? `: ${prop.localAliasName}` : "")).join(", ")}}: FormProps`,
    };
}

export function generateForm(
    {
        exportName,
        baseOutputFilename,
        targetDirectory,
        gqlIntrospection,
    }: { exportName: string; baseOutputFilename: string; targetDirectory: string; gqlIntrospection: IntrospectionQuery },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: FormConfig<any>,
): GeneratorReturn {
    assertValidConfig(config);

    const gqlType = config.gqlType;
    const instanceGqlType = gqlType[0].toLowerCase() + gqlType.substring(1);
    const formFragmentName = config.fragmentName ?? `${gqlType}Form`;
    const gqlDocuments: GQLDocumentConfigMap = {};

    const imports: Imports = [
        { name: "FormattedMessage", importPath: "react-intl" },
        { name: "useApolloClient", importPath: "@apollo/client" },
        { name: "useQuery", importPath: "@apollo/client" },
        { name: "gql", importPath: "@apollo/client" },
        { name: "CheckboxField", importPath: "@dextinity/admin" },
        { name: "Field", importPath: "@dextinity/admin" },
        { name: "filterByFragment", importPath: "@dextinity/admin" },
        { name: "FinalForm", importPath: "@dextinity/admin" },
        { name: "FinalFormInput", importPath: "@dextinity/admin" },
        { name: "FinalFormRangeInput", importPath: "@dextinity/admin" },
        { name: "FinalFormSelect", importPath: "@dextinity/admin" },
        { name: "FinalFormSubmitEvent", importPath: "@dextinity/admin" },
        { name: "Loading", importPath: "@dextinity/admin" },
        { name: "NumberField", importPath: "@dextinity/admin" },
        { name: "RadioGroupField", importPath: "@dextinity/admin" },
        { name: "TextAreaField", importPath: "@dextinity/admin" },
        { name: "TextField", importPath: "@dextinity/admin" },
        { name: "useFormApiRef", importPath: "@dextinity/admin" },
        { name: "useStackSwitchApi", importPath: "@dextinity/admin" },
        { name: "ArrowLeft", importPath: "@dextinity/admin-icons" },
        { name: "Lock", importPath: "@dextinity/admin-icons" },
        { name: "DateTimeField", importPath: "@dextinity/admin-date-time" },
        { name: "FinalFormDatePicker", importPath: "@dextinity/admin-date-time" },
        { name: "BlockState", importPath: "@dextinity/cms-admin" },
        { name: "createFinalFormBlock", importPath: "@dextinity/cms-admin" },
        { name: "queryUpdatedAt", importPath: "@dextinity/cms-admin" },
        { name: "resolveHasSaveConflict", importPath: "@dextinity/cms-admin" },
        { name: "useFormSaveConflict", importPath: "@dextinity/cms-admin" },
        { name: "FileUploadField", importPath: "@dextinity/cms-admin" },
        { name: "IconButton", importPath: "@mui/material" },
        { name: "MenuItem", importPath: "@mui/material" },
        { name: "InputAdornment", importPath: "@mui/material" },
        { name: "FormApi", importPath: "final-form" },
        { name: "useMemo", importPath: "react" },
    ];
    const formProps: Prop[] = [];

    const mode = config.mode ?? "all";
    const editMode = mode === "edit" || mode == "all";
    const addMode = mode === "add" || mode == "all";

    const createMutationType = addMode && findMutationTypeOrThrow(config.createMutation ?? `create${gqlType}`, gqlIntrospection);
    const updateMutationType = editMode && findMutationTypeOrThrow(`update${gqlType}`, gqlIntrospection);

    const createMutationHasPayloadResponse = createMutationType && hasPayloadResponseType(createMutationType, gqlType);
    const updateMutationHasPayloadResponse = updateMutationType && hasPayloadResponseType(updateMutationType, gqlType);

    // Extract error enum types from mutations
    const errorEnums = extractErrorEnumsFromMutations({
        createMutationType: createMutationHasPayloadResponse ? createMutationType : null,
        updateMutationType: updateMutationHasPayloadResponse ? updateMutationType : null,
        gqlIntrospection,
    });

    // Add imports for error handling if error enums exist
    if (errorEnums.createErrorEnum || errorEnums.updateErrorEnum) {
        imports.push({ name: "ReactNode", importPath: "react" });
        imports.push({ name: "FORM_ERROR", importPath: "final-form" });
        imports.push({ name: "FormattedMessage", importPath: "react-intl" });
    }

    const formFields = flatFormFieldsFromFormConfig(config);

    let useScopeFromContext = false;
    const gqlArgs: GqlArg[] = [];
    if (createMutationType) {
        const forwardedArgs = getForwardedGqlArgs({
            fields: formFields,
            gqlOperation: createMutationType,
            gqlIntrospection,
        });
        for (const forwardedArg of forwardedArgs) {
            imports.push(...forwardedArg.imports);
            if (forwardedArg.gqlArg.name === "scope" && !forwardedArg.gqlArg.isInputArgSubfield && !config.scopeAsProp) {
                useScopeFromContext = true;
                gqlArgs.push(forwardedArg.gqlArg);
            } else {
                formProps.push(forwardedArg.prop);
                gqlArgs.push(forwardedArg.gqlArg);
            }
        }
    }

    if (useScopeFromContext) {
        imports.push({ name: "useContentScope", importPath: "@dextinity/cms-admin" });
    }

    if (editMode) {
        if (mode === "all") {
            formProps.push({ name: "id", optional: true, type: "string" });
        } else if (mode === "edit") {
            formProps.push({ name: "id", optional: false, type: "string" });
        }
    }

    const rootBlockFields = formFields
        .filter((field) => field.type == "block")
        .map((field) => {
            // map is for ts to infer block type correctly
            if (field.type !== "block") {
                throw new Error("Field is not a block field");
            }
            return field;
        });
    rootBlockFields.forEach((field) => {
        if (isGeneratorConfigImport(field.block)) {
            imports.push(convertConfigImport(field.block));
        }
    });

    const readOnlyFields = formFields.filter((field) => field.readOnly);
    const fileFields = formFields.filter((field) => field.type == "fileUpload");

    if (fileFields.length > 0) {
        imports.push({ name: "GQLFinalFormFileUploadFragment", importPath: "@dextinity/cms-admin" });
        imports.push({ name: "GQLFinalFormFileUploadDownloadableFragment", importPath: "@dextinity/cms-admin" });
    }

    let hooksCode = "";
    const formFragmentFields: string[] = [];
    const formValuesConfig: GenerateFieldsReturn["formValuesConfig"] = [];
    const generatedFields = generateFields({
        gqlIntrospection,
        baseOutputFilename,
        fields: config.fields,
        formFragmentName,
        formConfig: config,
        gqlType: config.gqlType,
    });
    const fieldsCode = generatedFields.code;
    for (const name in generatedFields.gqlDocuments) {
        gqlDocuments[name] = {
            document: generatedFields.gqlDocuments[name].document,
            export: true,
        };
    }
    imports.push(...generatedFields.imports);
    formProps.push(...generatedFields.formProps);
    hooksCode += generatedFields.hooksCode;
    formFragmentFields.push(...generatedFields.formFragmentFields);
    formValuesConfig.push(...generatedFields.formValuesConfig);

    formProps.push({
        name: "onCreate",
        optional: true,
        type: `(id: string) => void`,
    });

    if (config.initialValuesAsProp) {
        formProps.push({
            name: "initialValues",
            localAliasName: "passedInitialValues",
            optional: true,
            type: `Partial<FormValues>`,
        });
    }

    const { formPropsTypeCode, formPropsParamsCode } = generateFormPropsCode(formProps);

    gqlDocuments[`${instanceGqlType}FormFragment`] = {
        document: generateFragmentByFormFragmentFields({ formFragmentName, gqlType, formFragmentFields }),
        export: editMode,
    };

    if (editMode) {
        gqlDocuments[`${instanceGqlType}Query`] = {
            document: generateGqlOperation({
                type: "query",
                operationName: gqlType,
                rootOperation: instanceGqlType,
                fields: ["id", "updatedAt", `...${formFragmentName}`],
                variables: [
                    {
                        name: "id",
                        type: "ID!",
                    },
                ],
                fragmentVariables: [`\${${`${instanceGqlType}FormFragment`}}`],
            }),
            export: true,
        };
    }

    if (addMode && createMutationType) {
        gqlDocuments[`create${gqlType}Mutation`] = {
            document: generateGqlOperation({
                type: "mutation",
                operationName: `Create${gqlType}`,
                rootOperation: createMutationType.name,
                fields: createMutationHasPayloadResponse
                    ? [
                          `${instanceGqlType}.id`,
                          `${instanceGqlType}.updatedAt`,
                          `${instanceGqlType}...${formFragmentName}`,
                          "errors.code",
                          "errors.field",
                      ]
                    : ["id", "updatedAt", `...${formFragmentName}`],
                fragmentVariables: [`\${${`${instanceGqlType}FormFragment`}}`],
                variables: [
                    ...gqlArgs
                        .filter((gqlArg) => !gqlArg.isInputArgSubfield)
                        .map((gqlArg) => ({
                            name: gqlArg.name,
                            type: `${gqlArg.type}!`,
                        })),
                    {
                        name: "input",
                        type: `${gqlType}Input!`,
                    },
                ],
            }),
            export: true,
        };
    }

    if (editMode) {
        gqlDocuments[`update${gqlType}Mutation`] = {
            document: generateGqlOperation({
                type: "mutation",
                operationName: `Update${gqlType}`,
                rootOperation: `update${gqlType}`,
                fields: updateMutationHasPayloadResponse
                    ? [
                          `${instanceGqlType}.id`,
                          `${instanceGqlType}.updatedAt`,
                          `${instanceGqlType}...${formFragmentName}`,
                          "errors.code",
                          "errors.field",
                      ]
                    : ["id", "updatedAt", `...${formFragmentName}`],
                fragmentVariables: [`\${${`${instanceGqlType}FormFragment`}}`],
                variables: [
                    {
                        name: "id",
                        type: "ID!",
                    },
                    {
                        name: "input",
                        type: `${gqlType}UpdateInput!`,
                    },
                ],
            }),
            export: true,
        };
    }

    for (const name in gqlDocuments) {
        const gqlDocument = gqlDocuments[name];
        imports.push({
            name: name,
            importPath: `./${baseOutputFilename}.gql`,
        });
        const match = gqlDocument.document.match(/^\s*(query|mutation|fragment)\s+(\w+)/);
        if (!match) {
            throw new Error(`Could not find query or mutation name in ${gqlDocument}`);
        }
        const type = match[1];
        const documentName = match[2];
        imports.push({
            name: `GQL${documentName}${type[0].toUpperCase() + type.substring(1)}`,
            importPath: `./${baseOutputFilename}.gql.generated`,
        });
        if (type !== "fragment") {
            imports.push({
                name: `GQL${documentName}${type[0].toUpperCase() + type.substring(1)}Variables`,
                importPath: `./${baseOutputFilename}.gql.generated`,
            });
        }
    }

    const finalFormSubscription = Object.keys(generatedFields.finalFormConfig?.subscription ?? {});
    const finalFormRenderProps = Object.keys(generatedFields.finalFormConfig?.renderProps ?? {});

    let filterByFragmentType = `GQL${formFragmentName}Fragment`;
    let customFilterByFragment = "";

    if (fileFields.length > 0) {
        const keysToOverride = fileFields.map((field) => field.name);

        customFilterByFragment = `type ${formFragmentName}Fragment = Omit<${filterByFragmentType}, ${keysToOverride
            .map((key) => `"${String(key)}"`)
            .join(" | ")}> & {
            ${fileFields
                .map((field) => {
                    if (field.type !== "fileUpload") {
                        throw new Error("Field is not a file upload field");
                    }

                    if (
                        ("multiple" in field && field.multiple) ||
                        ("maxFiles" in field && typeof field.maxFiles === "number" && field.maxFiles > 1)
                    ) {
                        return `${String(field.name)}: ${
                            field.download ? "GQLFinalFormFileUploadDownloadableFragment" : "GQLFinalFormFileUploadFragment"
                        }[];`;
                    }
                    return `${String(field.name)}: ${
                        field.download ? "GQLFinalFormFileUploadDownloadableFragment" : "GQLFinalFormFileUploadFragment"
                    } | null;`;
                })
                .join("\n")}
        }`;

        filterByFragmentType = `${formFragmentName}Fragment`;
    }

    // Add error enum type imports if they exist
    if (errorEnums.createErrorEnum) {
        const typeName = `GQL${errorEnums.createErrorEnum}`;
        imports.push({
            name: typeName,
            importPath: `@src/graphql.generated`,
        });
    }
    if (errorEnums.useDifferentEnums && errorEnums.updateErrorEnum) {
        const typeName = `GQL${errorEnums.updateErrorEnum}`;
        imports.push({
            name: typeName,
            importPath: `@src/graphql.generated`,
        });
    }

    // Generate error messages code
    let errorMessagesCode = "";
    if (errorEnums.useDifferentEnums) {
        // Generate separate create and update error messages
        if (errorEnums.createErrorEnum) {
            errorMessagesCode += generateErrorMessagesCode({
                enumName: errorEnums.createErrorEnum,
                gqlType: gqlType,
                variableName: "createErrorMessages",
                gqlIntrospection,
            });
            errorMessagesCode += "\n\n";
        }
        if (errorEnums.updateErrorEnum) {
            errorMessagesCode += generateErrorMessagesCode({
                enumName: errorEnums.updateErrorEnum,
                gqlType: gqlType,
                variableName: "updateErrorMessages",
                gqlIntrospection,
            });
        }
    } else if (errorEnums.createErrorEnum || errorEnums.updateErrorEnum) {
        // Generate single shared error messages object
        const enumName = (errorEnums.createErrorEnum || errorEnums.updateErrorEnum) as string;
        errorMessagesCode = generateErrorMessagesCode({
            enumName,
            gqlType: gqlType,
            variableName: "submissionErrorMessages",
            gqlIntrospection,
        });
    }

    const code = `
    ${generateImportsCode(imports)}
    import isEqual from "lodash.isequal";

    ${
        rootBlockFields.length > 0
            ? `const rootBlocks = {
                ${rootBlockFields.map((field) => `${String(field.name)}: ${field.block.name}`)}
                };`
            : ""
    }

    ${customFilterByFragment}

    ${generateFormValuesType({ formValuesConfig, filterByFragmentType, gqlIntrospection, gqlType })}

    ${formPropsTypeCode}

    ${errorMessagesCode}

    export function ${exportName}(${formPropsParamsCode}) {
        const client = useApolloClient();
        ${mode == "all" ? `const mode = id ? "edit" : "add";` : ""}
        const formApiRef = useFormApiRef<FormValues>();
        ${addMode ? `const stackSwitchApi = useStackSwitchApi();` : ""}
        ${useScopeFromContext ? `const { scope } = useContentScope();` : ""}

        ${
            editMode
                ? `
        const { data, error, loading, refetch } = useQuery<GQL${gqlType}Query, GQL${gqlType}QueryVariables>(
            ${instanceGqlType}Query,
            ${mode == "edit" ? `{ variables: { id } }` : `id ? { variables: { id } } : { skip: true }`},
        );
        `
                : ""
        }

        ${generateInitialValues({ mode, formValuesConfig, filterByFragmentType, gqlIntrospection, gqlType, initialValuesAsProp: !!config.initialValuesAsProp })}


        ${
            editMode
                ? `
        const saveConflict = useFormSaveConflict({
            checkConflict: async () => {
                const updatedAt = await queryUpdatedAt(client, "${instanceGqlType}", id);
                return resolveHasSaveConflict(data?.${instanceGqlType}.updatedAt, updatedAt);
            },
            formApiRef,
            loadLatestVersion: async () => {
                await refetch();
            },
        });
        `
                : ""
        }

        const handleSubmit = async (${generateDestructFormValueForInput({
            formValuesConfig,
            gqlIntrospection,
            gqlType,
        })}: FormValues, form: FormApi<FormValues>${addMode ? `, event: FinalFormSubmitEvent` : ""}) => {
            ${editMode ? `if (await saveConflict.checkForConflicts()) throw new Error("Conflicts detected");` : ""}
            ${generateFormValuesToGqlInput({ formValuesConfig, gqlIntrospection, gqlType })}

            ${mode == "all" ? `if (mode === "edit") {` : ""}
                ${
                    editMode
                        ? `
                ${readOnlyFields.some((field) => field.name === "id") ? "" : "if (!id) throw new Error();"}
                const { ${readOnlyFields.map((field) => `${String(field.name)},`).join("")} ...updateInput } = output;
                ${updateMutationHasPayloadResponse ? `const { data: mutationResponse } = ` : ""}await client.mutate<GQLUpdate${gqlType}Mutation, GQLUpdate${gqlType}MutationVariables>({
                    mutation: update${gqlType}Mutation,
                    variables: { id, input: updateInput },
                });
                ${
                    updateMutationHasPayloadResponse && updateMutationType && errorEnums.updateErrorEnum
                        ? `
                    ${generateErrorHandlingCode({
                        mutationResponsePath: `mutationResponse?.${updateMutationType.name}`,
                        errorMessagesVariable: errorEnums.useDifferentEnums ? "updateErrorMessages" : "submissionErrorMessages",
                    })}
                `
                        : ""
                }
                `
                        : ""
                }
            ${mode == "all" ? `} else {` : ""}
                ${
                    addMode && createMutationType
                        ? `
                const { data: mutationResponse } = await client.mutate<GQLCreate${gqlType}Mutation, GQLCreate${gqlType}MutationVariables>({
                    mutation: create${gqlType}Mutation,
                    variables: {
                        input: ${
                            gqlArgs.filter((prop) => prop.isInputArgSubfield).length
                                ? `{ ...output, ${gqlArgs
                                      .filter((prop) => prop.isInputArgSubfield)
                                      .map((prop) => prop.name)
                                      .join(",")} }`
                                : "output"
                        }${
                            gqlArgs.filter((prop) => !prop.isInputArgSubfield).length
                                ? `, ${gqlArgs
                                      .filter((prop) => !prop.isInputArgSubfield)
                                      .map((arg) => arg.name)
                                      .join(",")}`
                                : ""
                        } },
                });
                ${
                    createMutationHasPayloadResponse && errorEnums.createErrorEnum
                        ? `
                    ${generateErrorHandlingCode({
                        mutationResponsePath: `mutationResponse?.${createMutationType.name}`,
                        errorMessagesVariable: errorEnums.useDifferentEnums ? "createErrorMessages" : "submissionErrorMessages",
                    })}
                `
                        : ""
                }
                
                const id = mutationResponse?.${createMutationType.name}${createMutationHasPayloadResponse ? `.${instanceGqlType}?` : ""}.id;
                if (id) {
                    setTimeout(() => {
                        onCreate?.(id);
                        ${
                            config.navigateOnCreate === true || config.navigateOnCreate === undefined
                                ? `if (!event.navigatingBack) { stackSwitchApi.activatePage(\`edit\`, id);`
                                : ``
                        }
                    });
                }
                `
                        : ""
                }
            ${mode == "all" ? `}` : ""}
        };

        ${hooksCode}

        ${
            editMode
                ? ` if (error) throw error;

                    if (loading) {
                        return <Loading behavior="fillPageHeight" />;
                    }`
                : ``
        }

        return (
            <FinalForm<FormValues>
                apiRef={formApiRef}
                onSubmit={handleSubmit}
                mode=${mode == "all" ? `{mode}` : editMode ? `"edit"` : `"add"`}
                initialValues={initialValues}
                initialValuesEqual={isEqual} //required to compare block data correctly
                subscription={{ ${finalFormSubscription.length ? finalFormSubscription.map((field) => `${field}: true`).join(", ") : ``} }}
            >
                {(${finalFormRenderProps.length ? `{${finalFormRenderProps.join(", ")}}` : ``}) => (
                    ${editMode ? `<>` : ``}
                        ${editMode ? `{saveConflict.dialogs}` : ``}
                        <>
                            ${fieldsCode}
                        </>
                    ${editMode ? `</>` : ``}
                )}
            </FinalForm>
        );
    }

    `;

    return {
        code,
        gqlDocuments,
    };
}

/**
 * Checks if the provided form config is valid.
 *
 * Examples of invalid configs:
 * - The "id" field is not read-only
 *
 * @param config The form config to check.
 * @throws Will throw an error if the provided config is invalid.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertValidConfig(config: FormConfig<any>) {
    function validateFields(fields: typeof config.fields) {
        for (const field of fields) {
            if (isFormFieldConfig(field)) {
                if (field.name === "id" && !field.readOnly) {
                    throw new Error(`Invalid form config: the "id" field must be read-only`);
                }
            } else if (isFormLayoutConfig(field)) {
                validateFields(field.fields);
            }
        }
    }

    validateFields(config.fields);
}
