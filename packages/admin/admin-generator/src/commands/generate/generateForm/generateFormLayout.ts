import type { IntrospectionQuery } from "graphql";

import type { FormConfig, FormLayoutConfig, GQLDocumentConfigMap } from "../generate-command";
import { camelCaseToHumanReadable } from "../utils/camelCaseToHumanReadable";
import { findIntrospectionFieldType } from "../utils/findIntrospectionFieldType";
import type { Imports } from "../utils/generateImportsCode";
import { generateFormattedMessage } from "../utils/intl";
import { generateFields, type GenerateFieldsReturn } from "./generateFields";
import type { Prop } from "./generateForm";

export function generateFormLayout({
    gqlIntrospection,
    baseOutputFilename,
    config,
    formFragmentName,
    formConfig,
    gqlType,
    namePrefix,
}: {
    gqlIntrospection: IntrospectionQuery;
    baseOutputFilename: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: FormLayoutConfig<any>;
    formFragmentName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formConfig: FormConfig<any>;
    gqlType: string;
    namePrefix?: string;
}): GenerateFieldsReturn {
    const rootGqlType = formConfig.gqlType;
    const formattedMessageRootId = rootGqlType[0].toLowerCase() + rootGqlType.substring(1);
    const dataRootName = rootGqlType[0].toLowerCase() + rootGqlType.substring(1); // TODO should probably be deteced via query

    let code = "";
    let hooksCode = "";
    const formFragmentFields: string[] = [];
    const gqlDocuments: GQLDocumentConfigMap = {};
    const imports: Imports = [];
    const formProps: Prop[] = [];
    const formValuesConfig: GenerateFieldsReturn["formValuesConfig"] = [];
    const finalFormConfig = { subscription: {}, renderProps: {} };

    if (config.type === "fieldSet") {
        const generatedFields = generateFields({
            gqlIntrospection,
            baseOutputFilename,
            fields: config.fields,
            formFragmentName,
            formConfig,
            gqlType,
            namePrefix,
        });

        hooksCode += generatedFields.hooksCode;
        formFragmentFields.push(...generatedFields.formFragmentFields);
        for (const name in generatedFields.gqlDocuments) {
            gqlDocuments[name] = generatedFields.gqlDocuments[name];
        }
        imports.push(...generatedFields.imports);
        formProps.push(...generatedFields.formProps);
        formValuesConfig.push(...generatedFields.formValuesConfig);

        finalFormConfig.subscription = { ...finalFormConfig.subscription, ...generatedFields.finalFormConfig?.subscription };
        finalFormConfig.renderProps = { ...finalFormConfig.renderProps, ...generatedFields.finalFormConfig?.renderProps };

        imports.push({ name: "FieldSet", importPath: "@dextinity/admin" });
        const supportPlaceholder = config.supportText?.includes("{");
        if (supportPlaceholder) {
            imports.push({ name: "FormSpy", importPath: "react-final-form" });
        }
        code = `
        <FieldSet
            ${config.collapsible === undefined || config.collapsible ? `collapsible` : ``}
            ${config.initiallyExpanded != null ? `initiallyExpanded={${config.initiallyExpanded}}` : ``}
            title={${generateFormattedMessage({
                config: config.title,
                id: `${formattedMessageRootId}.${config.name}.title`,
                defaultMessage: camelCaseToHumanReadable(config.name),
                type: "jsx",
            })}}
            ${
                config.supportText
                    ? `supportText={
                        ${supportPlaceholder ? `mode === "edit" && (<FormSpy subscription={{ values: true }}>{({ values }) => (` : ``}
                        <FormattedMessage
                            id="${formattedMessageRootId}.${config.name}.supportText"
                            defaultMessage="${config.supportText}"
                            ${supportPlaceholder ? `values={{ ...values }}` : ``}
                        />
                        ${supportPlaceholder ? `)}</FormSpy>)` : ``}
                    }`
                    : ``
            }
        >
            ${generatedFields.code}
        </FieldSet>`;
    } else if (config.type === "optionalNestedFields") {
        const name = String(config.name);

        const introspectionFieldType = findIntrospectionFieldType({ name, gqlType, gqlIntrospection });
        if (!introspectionFieldType) {
            throw new Error(`field ${name} in gql introspection type ${gqlType} not found`);
        }
        if (introspectionFieldType.kind !== "OBJECT") {
            throw new Error(`field ${name} in gql introspection type ${gqlType} has to be OBJECT`);
        }

        const generatedFields = generateFields({
            gqlIntrospection,
            baseOutputFilename,
            fields: config.fields,
            formFragmentName,
            formConfig,
            gqlType: introspectionFieldType.name,
            namePrefix: name,
        });
        hooksCode += generatedFields.hooksCode;
        formFragmentFields.push(...generatedFields.formFragmentFields.map((field) => `${name}.${field}`));
        for (const name in generatedFields.gqlDocuments) {
            gqlDocuments[name] = generatedFields.gqlDocuments[name];
        }
        imports.push(...generatedFields.imports);
        formValuesConfig.push(...generatedFields.formValuesConfig);

        // first field is the "enabled" checkbox
        formValuesConfig.push({
            fieldName: `${name}Enabled`,
            omitFromFragmentType: false,
            destructFromFormValues: true,
            typeCode: {
                nullable: false,
                type: "boolean",
            },
            initializationCode: `!!data.${dataRootName}.${name}`,
        });

        // second field is the nested object, which is not a final-form field itself
        formValuesConfig.push({
            fieldName: `${name}`,
            wrapFormValueToGqlInputCode: `${name.split(".").pop()}Enabled && $fieldName ? $inner : null`,
        });

        imports.push({ name: "FinalFormSwitch", importPath: "@dextinity/admin" });
        imports.push({ name: "messages", importPath: "@dextinity/admin" });
        imports.push({ name: "FormControlLabel", importPath: "@mui/material" });

        code = `<Field
                    fullWidth
                    name="${String(config.name)}Enabled"
                    type="checkbox"
                    label={${generateFormattedMessage({
                        config: config.checkboxLabel,
                        id: `${formattedMessageRootId}.${String(config.name)}.${String(config.name)}Enabled`,
                        defaultMessage: `Enable ${camelCaseToHumanReadable(String(config.name))}`,
                        type: "jsx",
                    })}}
                >
                    {(props) => (
                        <FormControlLabel
                            control={<FinalFormSwitch {...props} />}
                            label={props.input.checked ? <FormattedMessage {...messages.yes} /> : <FormattedMessage {...messages.no} />}
                        />
                    )}
                </Field>
                 <Field name="${String(config.name)}Enabled" fullWidth subscription={{ value: true }}>
                    {({ input: { value } }) =>
                        value ? (
                            <>
                                ${generatedFields.code}
                            </>
                            ) : null
                    }
                </Field>`;
    } else {
        throw new Error(`Unsupported type`);
    }
    return {
        code,
        hooksCode,
        formFragmentFields,
        gqlDocuments,
        imports,
        formProps,
        formValuesConfig,
        finalFormConfig,
    };
}
