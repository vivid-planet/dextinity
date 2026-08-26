/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile, writeFile } from "node:fs/promises";

import type { ApolloClient } from "@apollo/client";
import type { GridColDef } from "@dextinity/admin";
import type { IconName } from "@dextinity/admin-icons";
import type { BlockInterface, ContentScope, FinalFormFileUploadProps } from "@dextinity/cms-admin";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import type { IconProps } from "@mui/material";
import type {
    GridCellParams,
    GridFilterItem,
    GridFilterOperator,
    GridRenderCellParams,
    GridSortDirection,
    GridValidRowModel,
} from "@mui/x-data-grid";
import { Command } from "commander";
import type { FieldValidator, FormApi } from "final-form";
import { promises as fs } from "fs";
import { glob } from "glob";
import { introspectionFromSchema } from "graphql";
import { basename, dirname } from "path";
import { format, resolveConfig } from "prettier";
import type { ComponentType, JSX, ReactElement } from "react";
import type { FormattedMessage, MessageDescriptor } from "react-intl";

import { parseConfig } from "./config/parseConfig";
import { generateForm } from "./generateForm/generateForm";
import { generateGrid } from "./generateGrid/generateGrid";
import type { UsableFields, UsableFormFields } from "./generateGrid/usableFields";
import type { ColumnVisibleOption } from "./utils/columnVisibility";
import { writeGenerated } from "./utils/writeGenerated";

export type FormattedMessageElement = ReactElement<MessageDescriptor, typeof FormattedMessage>;

type IconObject = Pick<IconProps, "color" | "fontSize"> & {
    name: IconName;
};

type Icon = IconName | IconObject | ComponentType;
export type Adornment = string | { icon: Icon };

type InputBaseFieldConfig = {
    startAdornment?: Adornment;
    endAdornment?: Adornment;
};

export type ComponentFormFieldConfig = { type: "component"; component: ComponentType };
function isComponentFormFieldConfig(arg: any): arg is ComponentFormFieldConfig {
    return arg && arg.type === "component";
}

export type StaticSelectValue = { value: string; label: string | FormattedMessageElement } | string;
type AsyncSelectFilter =
    | {
          /**
           * Filter by value of field in current form
           */
          type: "field";
          /**
           * Name of the field in current form, that will be used to filter the query
           */
          formFieldName: string;
          /**
           * Name of the graphql argument the prop will be applied to. Defaults to propdName.
           *
           * Root Argument or filter argument are supported.
           */
          rootQueryArg?: string;
      }
    | {
          /**
           * Filter by a prop passed into the form, this prop will be generated
           */
          type: "formProp";
          /**
           * Name of the prop generated for this form
           */
          propName: string;
          /**
           * Name of the graphql argument the prop will be applied to. Defaults to propdName.
           *
           * Root Argument or filter argument are supported.
           */
          rootQueryArg?: string;
      };

export type FormFieldConfig<T> = (
    | ({ type: "text"; name: UsableFormFields<T>; multiline?: boolean; initialValue?: string } & InputBaseFieldConfig)
    | ({ type: "number"; name: UsableFormFields<T>; decimals?: number; initialValue?: number } & InputBaseFieldConfig)
    | ({
          type: "numberRange";
          name: UsableFormFields<T>;
          minValue: number;
          maxValue: number;
          disableSlider?: boolean;
          initialValue?: { min: number; max: number };
      } & InputBaseFieldConfig)
    | { type: "boolean"; name: UsableFormFields<T>; initialValue?: boolean; checkboxLabel?: string | FormattedMessageElement }
    | ({ type: "date"; name: UsableFormFields<T>; initialValue?: string } & InputBaseFieldConfig)
    | ({ type: "dateTime"; name: UsableFormFields<T>; initialValue?: Date } & InputBaseFieldConfig)
    | ({
          type: "staticSelect";
          name: UsableFormFields<T>;
          values?: StaticSelectValue[];
          inputType?: "select" | "radio";
          initialValue?: string;
      } & Omit<InputBaseFieldConfig, "endAdornment">)
    | ({
          type: "asyncSelect";
          name: UsableFormFields<T>;
          rootQuery: string;
          labelField?: string;
          /** Whether Autocomplete or Select should be used.
           *
           * defaults to true if rootQuery has a search argument
           */
          autocomplete?: boolean;
          /**
           * filter for query, passed as variable to graphql query
           */
          filter?: AsyncSelectFilter;
      } & Omit<InputBaseFieldConfig, "endAdornment">)
    | ({
          type: "asyncSelectFilter";
          name: string;
          loadValueQueryField: string; //TODO improve typing, use something similar to UsableFormFields<T>;
          rootQuery: string;
          labelField?: string;
          /** Whether Autocomplete or Select should be used.
           *
           * defaults to true if rootQuery has a search argument
           */
          autocomplete?: boolean;
          /**
           * filter for query, passed as variable to graphql query
           */
          filter?: AsyncSelectFilter;
      } & Omit<InputBaseFieldConfig, "endAdornment">)
    | { type: "block"; name: UsableFormFields<T>; block: BlockInterface }
    | ({ type: "fileUpload"; multiple?: false; name: UsableFormFields<T>; maxFiles?: 1; download?: boolean } & Pick<
          Partial<FinalFormFileUploadProps<false>>,
          "maxFileSize" | "readOnly" | "layout" | "accept"
      >)
    | ({ type: "fileUpload"; multiple: true; name: UsableFormFields<T>; maxFiles?: number; download?: boolean } & Pick<
          Partial<FinalFormFileUploadProps<true>>,
          "maxFileSize" | "readOnly" | "layout" | "accept"
      >)
) & {
    label?: string | FormattedMessageElement;
    required?: boolean;
    validate?: FieldValidator<unknown>;
    helperText?: string | FormattedMessageElement;
    readOnly?: boolean;
};

export function isFormFieldConfig<T>(arg: any): arg is FormFieldConfig<T> {
    return !isFormLayoutConfig(arg) && !isComponentFormFieldConfig(arg);
}

type OptionalNestedFieldsConfig<T> = {
    type: "optionalNestedFields";
    name: UsableFormFields<T>; // object name containing fields
    checkboxLabel?: string | FormattedMessageElement;
    fields: FormFieldConfig<any>[];
};
export type FormLayoutConfig<T> =
    | {
          type: "fieldSet";
          name: string;
          title?: string | FormattedMessageElement;
          supportText?: string; // can contain field-placeholder
          collapsible?: boolean; // default true
          initiallyExpanded?: boolean; // default false
          fields: (FormFieldConfig<T> | OptionalNestedFieldsConfig<T> | ComponentFormFieldConfig)[];
      }
    | OptionalNestedFieldsConfig<T>;

export function isFormLayoutConfig<T>(arg: any): arg is FormLayoutConfig<T> {
    return arg.type !== undefined && ["fieldSet", "optionalNestedFields"].includes(arg.type);
}

export type FormConfig<T extends { __typename?: string }> = {
    type: "form";
    gqlType: T["__typename"];
    mode?: "edit" | "add" | "all";
    fragmentName?: string;
    createMutation?: string;
    /**
     * If true, scope will be passed as prop, if false scope will be fetched from ContentScopeContext
     * @default false
     */
    scopeAsProp?: boolean;
    fields: (FormFieldConfig<T> | FormLayoutConfig<T> | ComponentFormFieldConfig)[];
    /**
     * If true, the form will navigate to the edit page using stackSwitchApi.activatePage of the newly created item after a successful creation.
     * @default true
     */
    navigateOnCreate?: boolean;
    /**
     * If true, the generated form will have an initialValues prop to set initial form values.
     * @default false
     */
    initialValuesAsProp?: boolean;
};
export type InjectedFormVariables = {
    id?: string;
    mode?: "edit" | "add";
    client: ApolloClient<object>;
    formApi: FormApi<unknown, Partial<unknown>>;
    scope: ContentScope;
};
export function injectFormVariables<T>(fn: (injectedVariables: InjectedFormVariables) => T): T {
    // this function is only used in config but never called at runtime
    return fn({} as any);
}

type BaseColumnConfig = Pick<GridColDef, "width" | "minWidth" | "maxWidth" | "flex" | "pinned" | "disableExport"> & {
    headerName?: string | FormattedMessageElement;
    headerInfoTooltip?: string | FormattedMessageElement;
    visible?: ColumnVisibleOption;
    fieldName?: string; // this can be used to overwrite field-prop of column-config
};

export type GridColumnStaticSelectLabelCellContent = {
    primaryText?: string | FormattedMessageElement;
    secondaryText?: string | FormattedMessageElement;
    icon?: Icon;
};

export type GridColumnStaticSelectValue =
    | StaticSelectValue
    | {
          value: string | number | boolean;
          label: string | FormattedMessageElement | GridColumnStaticSelectLabelCellContent;
      }
    | number
    | boolean;

export type GridColumnConfig<T extends GridValidRowModel> = (
    | { type: "text"; renderCell?: (params: GridRenderCellParams<T, any, any>) => JSX.Element }
    | { type: "number"; currency?: string; decimals?: number; renderCell?: (params: GridRenderCellParams<T, any, any>) => JSX.Element }
    | { type: "boolean"; renderCell?: (params: GridRenderCellParams<T, any, any>) => JSX.Element }
    | { type: "date"; renderCell?: (params: GridRenderCellParams<T, any, any>) => JSX.Element }
    | { type: "dateTime"; renderCell?: (params: GridRenderCellParams<T, any, any>) => JSX.Element }
    | { type: "staticSelect"; values?: GridColumnStaticSelectValue[] }
    | { type: "block"; block: BlockInterface }
    | { type: "id"; renderCell?: (params: GridRenderCellParams<T, any, any>) => JSX.Element }
    | {
          type: "manyToMany";
          renderCell?: (params: GridRenderCellParams<T, any, any>) => JSX.Element;
          queryFields?: UsableFields<T, true>[];
          /**
           * The field to use as label for the default renderCell implementation.
           */
          labelField?: string;
      }
    | {
          type: "oneToMany";
          renderCell?: (params: GridRenderCellParams<T, any, any>) => JSX.Element;
          queryFields?: UsableFields<T, true>[];
          /**
           * The field to use as label for the default renderCell implementation.
           */
          labelField?: string;
      }
) & { name: UsableFields<T>; filterOperators?: GridFilterOperator[] } & BaseColumnConfig;

export type ActionsGridColumnConfig<T> = {
    type: "actions";
    queryFields?: UsableFields<T, true>[];
    component?: ComponentType<GridCellParams>;
} & BaseColumnConfig;
export type VirtualGridColumnConfig<T extends GridValidRowModel> = {
    type: "virtual";
    name: string;
    queryFields?: UsableFields<T, true>[];
    renderCell: (params: GridRenderCellParams<T, any, any>) => JSX.Element;
} & Pick<GridColDef, "sortBy"> &
    BaseColumnConfig;

type InitialFilterConfig = {
    items: GridFilterItem[];
    linkOperator?: "and" | "or";
};

// Additional type is necessary to avoid "TS2589: Type instantiation is excessively deep and possibly infinite."
type GridConfigGridColumnDef<T extends { __typename?: string }> = GridColumnConfig<T> | ActionsGridColumnConfig<T> | VirtualGridColumnConfig<T>;

export type GridConfig<T extends { __typename?: string }> = {
    type: "grid";
    gqlType: T["__typename"];
    fragmentName?: string;
    query?: string;
    queryParamsPrefix?: string;
    columns: Array<GridConfigGridColumnDef<T>>;
    excelExport?: boolean;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
    readOnly?: boolean;
    initialSort?: Array<{ field: string; sort: GridSortDirection }>;
    initialFilter?: InitialFilterConfig;
    filterProp?: boolean;
    toolbar?: boolean;
    toolbarActionProp?: boolean;
    newEntryText?: string | FormattedMessageElement;
    rowActionProp?: boolean;
    selectionProps?: "multiSelect" | "singleSelect";
    rowReordering?: {
        enabled: boolean;
        dragPreviewField?: UsableFields<T>;
    };
    /**
     * If true, scope will be passed as prop, if false scope will be fetched from ContentScopeContext
     * @default false
     */
    scopeAsProp?: boolean;
    density?: "comfortable" | "compact" | "standard";
    crudContextMenu?: {
        deleteType?: "delete" | "remove";
        deleteText?: string;
    };
    initialPageSize?: number;
};

export type GeneratorConfig<T extends { __typename?: string }> = FormConfig<T> | GridConfig<T>;

export function defineConfig<T extends { __typename?: string }>(config: GeneratorConfig<T>) {
    return config;
}

type GQLDocumentConfig = { document: string; export: boolean };
export type GQLDocumentConfigMap = Record<string, GQLDocumentConfig>;
export type GeneratorReturn = { code: string; gqlDocuments: GQLDocumentConfigMap };

/**
 * @experimental
 */
async function runGenerate(filePattern = "src/**/*.dextinityGen.{ts,tsx}") {
    const schema = await loadSchema("./schema.gql", {
        loaders: [new GraphQLFileLoader()],
    });
    const gqlIntrospection = introspectionFromSchema(schema);
    const writtenFiles: string[] = [];

    const files: string[] = await glob(filePattern);
    for (const file of files) {
        let outputCode = "";
        let gqlDocumentsOutputCode = "";
        const targetDirectory = `${dirname(file)}/generated`;
        const baseOutputFilename = basename(file).replace(/\.dextinityGen\.tsx?$/, "");

        console.log(`generating ${file}`);

        const config = await parseConfig(`${process.cwd()}/${file}`);

        const codeOuputFilename = `${targetDirectory}/${basename(file.replace(/\.dextinityGen\.tsx?$/, ""))}.tsx`;
        await fs.rm(codeOuputFilename, { force: true });

        const exportName = file.match(/([^/]+)\.dextinityGen\.tsx?$/)?.[1];
        if (!exportName) {
            throw new Error("Can not determine exportName");
        }

        let generated: GeneratorReturn;
        if (config.type == "form") {
            generated = generateForm({ exportName, gqlIntrospection, baseOutputFilename, targetDirectory }, config);
        } else if (config.type == "grid") {
            generated = generateGrid({ exportName, gqlIntrospection, baseOutputFilename, targetDirectory }, config);
        } else {
            throw new Error(`Unknown config type`);
        }
        outputCode += generated.code;
        for (const queryName in generated.gqlDocuments) {
            const exportStatement = generated.gqlDocuments[queryName].export ? "export " : "";
            gqlDocumentsOutputCode += `${exportStatement} const ${queryName} = gql\`${generated.gqlDocuments[queryName].document}\`\n`;
        }

        await writeGenerated(codeOuputFilename, outputCode);
        writtenFiles.push(codeOuputFilename);

        if (gqlDocumentsOutputCode != "") {
            const gqlDocumentsOuputFilename = `${targetDirectory}/${basename(file.replace(/\.dextinityGen\.tsx?$/, ""))}.gql.tsx`;
            await fs.rm(gqlDocumentsOuputFilename, { force: true });
            gqlDocumentsOutputCode = `import { gql } from "@apollo/client";
                import { finalFormFileUploadFragment, finalFormFileUploadDownloadableFragment } from "@dextinity/cms-admin";

                ${gqlDocumentsOutputCode}
            `;
            await writeGenerated(gqlDocumentsOuputFilename, gqlDocumentsOutputCode);
            writtenFiles.push(gqlDocumentsOuputFilename);
        }
        console.log("");
    }
    if (writtenFiles.length > 0) {
        console.log(`Formatting ${writtenFiles.length} generated files...`);
        await Promise.all(
            writtenFiles.map(async (filepath) => {
                const [content, options] = await Promise.all([readFile(filepath, "utf-8"), resolveConfig(filepath)]);
                const formatted = await format(content, { ...options, filepath });
                await writeFile(filepath, formatted);
            }),
        );
    }
}

export const generateCommand = new Command("generate")
    .option("-f, --file <file>", "path to config file or glob pattern to generate specific files")
    .action(async ({ file: filePattern }: { file?: string }) => {
        console.log("️️️⚠️️️⚠️️️⚠️️️  Admin Generator is still experimental and in beta phase.  ⚠️️️⚠️️️⚠️️️\n\n");
        await runGenerate(filePattern);
    });
