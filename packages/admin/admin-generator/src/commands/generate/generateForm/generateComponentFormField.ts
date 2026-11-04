import type { ComponentFormFieldConfig } from "../generate-command";
import { convertConfigImport } from "../utils/convertConfigImport";
import { isGeneratorConfigImport } from "../utils/runtimeTypeGuards";
import type { GenerateFieldsReturn } from "./generateFields";

export function generateComponentFormField({ config }: { config: ComponentFormFieldConfig }): GenerateFieldsReturn {
    if (!isGeneratorConfigImport(config.component)) {
        throw new Error("config.component must be a GeneratorConfigImport");
    }
    const imports = [convertConfigImport(config.component)];
    const code = `<${config.component.name} />`;

    return {
        imports,
        formProps: [],
        hooksCode: "",
        formFragmentFields: [],
        formValuesConfig: [],
        finalFormConfig: undefined,
        code,
        gqlDocuments: {},
    };
}
