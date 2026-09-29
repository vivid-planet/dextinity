import type { IntrospectionEnumType, IntrospectionNamedTypeRef, IntrospectionQuery } from "graphql";

import type { FormConfig, FormFieldConfig, GQLDocumentConfigMap } from "../generate-command";
import { camelCaseToHumanReadable } from "../utils/camelCaseToHumanReadable";
import { convertConfigImport } from "../utils/convertConfigImport";
import { findIntrospectionFieldType } from "../utils/findIntrospectionFieldType";
import type { Imports } from "../utils/generateImportsCode";
import { generateFormattedMessage } from "../utils/intl";
import { isFieldOptional } from "../utils/isFieldOptional";
import { isGeneratorConfigCode, isGeneratorConfigImport } from "../utils/runtimeTypeGuards";
import { generateAsyncSelect } from "./asyncSelect/generateAsyncSelect";
import { buildFormFieldOptions } from "./formField/options";
import type { GenerateFieldsReturn } from "./generateFields";
import type { Prop } from "./generateForm";

export function generateFormField({
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
    config: FormFieldConfig<any>;
    formFragmentName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formConfig: FormConfig<any>;
    gqlType: string;
    namePrefix?: string;
}): GenerateFieldsReturn {
    if (config.type == "asyncSelect" || config.type == "asyncSelectFilter") {
        return generateAsyncSelect({ gqlIntrospection, baseOutputFilename, config, formConfig, gqlType, namePrefix });
    }
    const imports: Imports = [];
    const formProps: Prop[] = [];

    const {
        name,
        formattedMessageRootId,
        fieldLabel,
        startAdornment,
        endAdornment,
        imports: optionsImports,
    } = buildFormFieldOptions({ config, formConfig });
    imports.push(...optionsImports);

    let introspectionFieldType = findIntrospectionFieldType({ name, gqlIntrospection, gqlType });

    const nameWithPrefix = `${namePrefix ? `${namePrefix}.` : ``}${name}`;

    const rootGqlType = formConfig.gqlType;

    const dataRootName = rootGqlType[0].toLowerCase() + rootGqlType.substring(1); // TODO should probably be deteced via query

    const required = !isFieldOptional({ config, gqlIntrospection, gqlType });

    //TODO verify introspectionField.type is compatbile with config.type

    const endAdornmentWithLockIconProp = `endAdornment={<InputAdornment position="end"><Lock /></InputAdornment>}`;
    const readOnlyProps = `readOnly disabled`;
    const readOnlyPropsWithLock = `${readOnlyProps} ${endAdornmentWithLockIconProp}`;

    const formValueConfig: GenerateFieldsReturn["formValuesConfig"][0] = {
        fieldName: nameWithPrefix,
    };

    const gqlDocuments: GQLDocumentConfigMap = {};
    const hooksCode = "";
    let finalFormConfig: GenerateFieldsReturn["finalFormConfig"];

    let validateCode = "";
    if (config.validate) {
        if (isGeneratorConfigImport(config.validate)) {
            imports.push(convertConfigImport(config.validate));
            validateCode = `validate={${config.validate.name}}`;
        } else if (isGeneratorConfigCode(config.validate)) {
            validateCode = `validate={${config.validate.code}}`;
            imports.push(...config.validate.imports.map((imprt) => convertConfigImport(imprt)));
        }
    }

    let code = "";
    let formFragmentFields = [name];
    if (config.type == "text") {
        const TextInputComponent = config.multiline ? "TextAreaField" : "TextField";
        code = `
        <${TextInputComponent}
            ${required ? "required" : ""}
            ${config.readOnly ? readOnlyPropsWithLock : ""}
            variant="horizontal"
            fullWidth
            name="${nameWithPrefix}"
            label={${fieldLabel}}
            ${config.startAdornment ? `startAdornment={<InputAdornment position="start">${startAdornment.adornmentString}</InputAdornment>}` : ""}
            ${config.endAdornment ? `endAdornment={<InputAdornment position="end">${endAdornment.adornmentString}</InputAdornment>}` : ""}
            ${
                config.helperText
                    ? `helperText={${generateFormattedMessage({
                          config: config.helperText,
                          id: `${formattedMessageRootId}.${name}.helperText`,
                          type: "jsx",
                      })}}`
                    : ""
            }
            ${validateCode}
        />`;
        if (!required && !config.readOnly) {
            formValueConfig.formValueToGqlInputCode = `$fieldName ?? null`;
        }
        if (config.initialValue !== undefined) {
            formValueConfig.defaultInitializationCode = JSON.stringify(config.initialValue);
        }
    } else if (config.type == "number") {
        code = `
            <NumberField
                ${required ? "required" : ""}
                ${config.readOnly ? readOnlyPropsWithLock : ""}
                variant="horizontal"
                fullWidth
                name="${nameWithPrefix}"
                label={${fieldLabel}}
                ${config.decimals ? `decimals={${config.decimals}}` : ""}
                ${config.startAdornment ? `startAdornment={<InputAdornment position="start">${startAdornment.adornmentString}</InputAdornment>}` : ""}
                ${config.endAdornment ? `endAdornment={<InputAdornment position="end">${endAdornment.adornmentString}</InputAdornment>}` : ""}
                ${
                    config.helperText
                        ? `helperText={<FormattedMessage id=` +
                          `"${formattedMessageRootId}.${name}.helperText" ` +
                          `defaultMessage="${config.helperText}" />}`
                        : ""
                }
                ${validateCode}
            />`;
        if (!required && !config.readOnly) {
            formValueConfig.formValueToGqlInputCode = `$fieldName ?? null`;
        }
        if (config.initialValue !== undefined) {
            formValueConfig.defaultInitializationCode = JSON.stringify(config.initialValue);
        }
    } else if (config.type === "numberRange") {
        code = `
            <Field
                ${required ? "required" : ""}
                ${config.readOnly ? readOnlyPropsWithLock : ""}
                variant="horizontal"
                fullWidth
                name="${nameWithPrefix}"
                component={FinalFormRangeInput}
                label={${fieldLabel}}
                min={${config.minValue}}
                max={${config.maxValue}}
                ${config.disableSlider ? "disableSlider" : ""}
                ${config.startAdornment ? `startAdornment={<InputAdornment position="start">${startAdornment.adornmentString}</InputAdornment>}` : ""}
                ${config.endAdornment ? `endAdornment={<InputAdornment position="end">${endAdornment.adornmentString}</InputAdornment>}` : ""}
                ${
                    config.helperText
                        ? `helperText={<FormattedMessage id=` +
                          `"${formattedMessageRootId}.${name}.helperText" ` +
                          `defaultMessage="${config.helperText}" />}`
                        : ""
                }
                ${validateCode}
            />`;

        formFragmentFields = [`${name}.min`, `${name}.max`];
        if (config.initialValue !== undefined) {
            formValueConfig.defaultInitializationCode = JSON.stringify(config.initialValue);
        }
    } else if (config.type == "boolean") {
        const checkboxLabel = config.checkboxLabel
            ? generateFormattedMessage({
                  config: config.checkboxLabel,
                  id: `${formattedMessageRootId}.${name}.checkboxLabel`,
                  type: "jsx",
              })
            : "";
        code = `<CheckboxField
                        fieldLabel={${fieldLabel}}
                        ${config.checkboxLabel ? `label={${checkboxLabel}}` : ""}
                        name="${nameWithPrefix}"
                        fullWidth
                        variant="horizontal"
                        ${config.readOnly ? readOnlyProps : ""}
                        ${
                            config.helperText
                                ? `helperText={<FormattedMessage id=` +
                                  `"${formattedMessageRootId}.${name}.helperText" ` +
                                  `defaultMessage="${config.helperText}" />}`
                                : ""
                        }
                        ${validateCode}
                    />`;
        formValueConfig.defaultInitializationCode = config.initialValue ? "true" : "false";
    } else if (config.type == "date") {
        imports.push({
            name: "DatePickerField",
            importPath: "@dextinity/admin",
        });
        code = `
            <DatePickerField
                ${required ? "required" : ""}
                ${config.readOnly ? readOnlyPropsWithLock : ""}
                variant="horizontal"
                fullWidth
                name="${nameWithPrefix}"
                label={${fieldLabel}}
                ${config.startAdornment ? `startAdornment={<InputAdornment position="start">${startAdornment.adornmentString}</InputAdornment>}` : ""}
                ${config.endAdornment ? `endAdornment={<InputAdornment position="end">${endAdornment.adornmentString}</InputAdornment>}` : ""}
                ${
                    config.helperText
                        ? `helperText={<FormattedMessage id=` +
                          `"${formattedMessageRootId}.${name}.helperText" ` +
                          `defaultMessage="${config.helperText}" />}`
                        : ""
                }
                ${validateCode}
            />`;
        if (!required && !config.readOnly) {
            formValueConfig.formValueToGqlInputCode = `$fieldName ?? null`;
        }
        if (config.initialValue !== undefined) {
            formValueConfig.defaultInitializationCode = JSON.stringify(config.initialValue);
        }
    } else if (config.type == "dateTime") {
        imports.push({
            name: "DateTimePickerField",
            importPath: "@dextinity/admin",
        });
        code = `<DateTimePickerField
                ${required ? "required" : ""}
                ${config.readOnly ? readOnlyPropsWithLock : ""}
                variant="horizontal"
                fullWidth
                name="${nameWithPrefix}"
                label={${fieldLabel}}
                ${config.startAdornment ? `startAdornment={<InputAdornment position="start">${startAdornment.adornmentString}</InputAdornment>}` : ""}
                ${config.endAdornment ? `endAdornment={<InputAdornment position="end">${endAdornment.adornmentString}</InputAdornment>}` : ""}
                ${
                    config.helperText
                        ? `helperText={<FormattedMessage id=` +
                          `"${formattedMessageRootId}.${name}.helperText" ` +
                          `defaultMessage="${config.helperText}" />}`
                        : ""
                }
                ${validateCode}
            />`;
        formValueConfig.initializationCode = `data.${dataRootName}.${nameWithPrefix} ? new Date(data.${dataRootName}.${nameWithPrefix}) : undefined`;
        formValueConfig.omitFromFragmentType = true;
        formValueConfig.typeCode = {
            nullable: !required,
            type: `Date${!required ? " | null" : ""}`,
        };
        if (!config.readOnly) {
            formValueConfig.formValueToGqlInputCode = required ? `$fieldName.toISOString()` : `$fieldName ? $fieldName.toISOString() : null`;
        }
        if (config.initialValue !== undefined) {
            formValueConfig.defaultInitializationCode = `new Date("${config.initialValue.toISOString()}")`;
        }
    } else if (config.type == "block") {
        code = `<Field name="${nameWithPrefix}" isEqual={isEqual} label={${fieldLabel}} variant="horizontal" fullWidth>
            {createFinalFormBlock(rootBlocks.${String(config.name)})}
        </Field>`;
        formValueConfig.formValueToGqlInputCode = `rootBlocks.${name}.state2Output($fieldName)`;
        formValueConfig.omitFromFragmentType = true;
        formValueConfig.typeCode = { nullable: false, type: `BlockState<typeof rootBlocks.${name}>` };
        formValueConfig.initializationCode = `rootBlocks.${name}.input2State(data.${dataRootName}.${nameWithPrefix})`;
        formValueConfig.defaultInitializationCode = `rootBlocks.${name}.defaultValues()`;
    } else if (config.type === "fileUpload") {
        const multiple = config.multiple || (typeof config.maxFiles === "number" && config.maxFiles > 1);
        code = `<FileUploadField name="${name}" label={${fieldLabel}}
            variant="horizontal"
            ${config.multiple ? "multiple" : ""}
            ${config.maxFiles ? `maxFiles={${config.maxFiles}}` : ""}
            ${config.maxFileSize ? `maxFileSize={${config.maxFileSize}}` : ""}
            ${config.readOnly ? `readOnly` : ""}
            ${config.layout ? `layout="${config.layout}"` : ""}
            ${config.accept ? `accept="${config.accept}"` : ""}
        />`;
        if (multiple) {
            formValueConfig.formValueToGqlInputCode = `$fieldName?.map(({ id }) => id)`;
        } else {
            formValueConfig.formValueToGqlInputCode = `$fieldName ? $fieldName.id : null`;
        }
        formFragmentFields = [`${name}...${config.download ? "FinalFormFileUploadDownloadable" : "FinalFormFileUpload"}`];
    } else if (config.type == "staticSelect") {
        const multiple = introspectionFieldType?.kind === "LIST";
        if (introspectionFieldType?.kind === "LIST") {
            introspectionFieldType =
                introspectionFieldType.ofType.kind === "NON_NULL" ? introspectionFieldType.ofType.ofType : introspectionFieldType.ofType;
        }

        const enumType = gqlIntrospection.__schema.types.find(
            (t) => t.kind === "ENUM" && t.name === (introspectionFieldType as IntrospectionNamedTypeRef).name,
        ) as IntrospectionEnumType | undefined;
        if (!enumType) {
            throw new Error(`Enum type ${(introspectionFieldType as IntrospectionNamedTypeRef).name} not found for field ${name}`);
        }

        const values = (config.values ? config.values : enumType.enumValues.map((i) => i.name)).map((value) => {
            if (typeof value === "string") {
                const messageId = `${formattedMessageRootId}.${name}.${value.charAt(0).toLowerCase() + value.slice(1)}`;
                const valueLabel = generateFormattedMessage({
                    config: undefined,
                    defaultMessage: camelCaseToHumanReadable(value),
                    id: messageId,
                    type: "jsx",
                });
                return {
                    value,
                    labelCode: valueLabel,
                };
            } else {
                const messageId = `${formattedMessageRootId}.${name}.${value.value.charAt(0).toLowerCase() + value.value.slice(1)}`;
                const valueLabel = generateFormattedMessage({
                    config: value.label,
                    id: messageId,
                    type: "jsx",
                });
                return {
                    value: value.value,
                    labelCode: valueLabel,
                };
            }
        });

        let inputType = config.inputType;
        if (!inputType) {
            if (!required || multiple) {
                // radio is not clearable, render always as select if not required
                // radio doesn't support multiple
                inputType = "select";
            } else {
                // auto select/radio based on number of values
                if (values.length <= 5) {
                    inputType = "radio";
                } else {
                    inputType = "select";
                }
            }
        }
        if (inputType === "radio" && multiple) {
            throw new Error(`${name}: inputType=radio doesn't support multiple`);
        }
        if (inputType === "radio" && !required) {
            throw new Error(`${name}: inputType=radio must be required as it doesn't support clearable`);
        }

        const renderAsRadio = inputType === "radio";
        if (renderAsRadio) {
            code = `<RadioGroupField
             ${required ? "required" : ""}
              variant="horizontal"
             fullWidth
             name="${nameWithPrefix}"
             label={${fieldLabel}}
             options={[
                  ${values
                      .map((value) => {
                          return `{
                                label: ${value.labelCode},
                                value: "${value.value}",
                            }`;
                      })
                      .join(",")}
            ]}/>`;
        } else {
            imports.push({
                name: "SelectField",
                importPath: "@dextinity/admin",
            });
            code = `<SelectField
                            ${required ? "required" : ""}
                             fullWidth
                                variant={"horizontal"}
                                name="${nameWithPrefix}"
                                label={${fieldLabel}}
                                ${config.startAdornment ? `startAdornment={<InputAdornment position="start">${startAdornment.adornmentString}</InputAdornment>}` : ""}
                                ${
                                    config.helperText
                                        ? `helperText={<FormattedMessage id=` +
                                          `"${formattedMessageRootId}.${name}.helperText" ` +
                                          `defaultMessage="${config.helperText}" />}`
                                        : ""
                                }
                                ${validateCode}
                                ${config.readOnly ? readOnlyPropsWithLock : ""}
                                ${multiple ? "multiple" : ""}
                                options={[${values.map((value) => {
                                    return `{
                                        value: "${value.value}",
                                        label: ${value.labelCode}
                                    }`;
                                })}]}
                            />`;
        }
        if (config.initialValue !== undefined) {
            formValueConfig.defaultInitializationCode = JSON.stringify(config.initialValue);
        }
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
        formValuesConfig: [formValueConfig],
        finalFormConfig,
    };
}
