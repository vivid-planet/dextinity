import { dirname } from "node:path";

import { type CrudGeneratorOptions, getCrudSearchFieldsFromMetadata, hasCrudFieldFeature, SCOPED_ENTITY_METADATA_KEY } from "@dextinity/cms-api";
import type { EntityMetadata } from "@mikro-orm/core";

import { buildNameVariants } from "../utils/build-name-variants";
import { integerTypes } from "../utils/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFilterProps(metadata: EntityMetadata<any>) {
    const dedicatedResolverArgProps = buildDedicatedResolverArgProps(metadata);

    const crudFilterProps = metadata.props.filter(
        (prop) =>
            hasCrudFieldFeature(metadata.class, prop.name, "filter") &&
            !prop.name.startsWith("scope_") &&
            prop.name != "position" &&
            (!prop.embedded || hasCrudFieldFeature(metadata.class, prop.embedded[0], "filter")) && // the whole embeddable has filter disabled
            (prop.enum ||
                prop.type === "string" ||
                prop.type === "text" ||
                prop.type === "DecimalType" ||
                prop.type === "number" ||
                integerTypes.includes(prop.type) ||
                prop.type === "BooleanType" ||
                prop.type === "boolean" ||
                prop.type === "DateType" ||
                prop.type === "Date" ||
                prop.kind === "m:1" ||
                prop.kind === "1:m" ||
                prop.kind === "m:n" ||
                prop.type === "EnumArrayType" ||
                prop.type === "uuid") &&
            !dedicatedResolverArgProps.some((dedicatedResolverArgProp) => dedicatedResolverArgProp.name == prop.name),
    );
    return crudFilterProps;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSortProps(metadata: EntityMetadata<any>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function directSortProps(metadata: EntityMetadata<any>) {
        return metadata.props
            .filter(
                (prop) =>
                    hasCrudFieldFeature(metadata.class, prop.name, "sort") &&
                    !prop.name.startsWith("scope_") &&
                    !prop.primary &&
                    (!prop.embedded || hasCrudFieldFeature(metadata.class, prop.embedded[0], "sort")) && // the whole embeddable has sort disabled
                    (prop.type === "string" ||
                        prop.type === "text" ||
                        prop.type === "DecimalType" ||
                        prop.type === "number" ||
                        integerTypes.includes(prop.type) ||
                        prop.type === "BooleanType" ||
                        prop.type === "boolean" ||
                        prop.type === "DateType" ||
                        prop.type === "Date" ||
                        prop.kind === "m:1" ||
                        prop.type === "EnumArrayType" ||
                        prop.enum),
            )
            .map((prop) => {
                return prop.name;
            });
    }
    const crudSortProps = directSortProps(metadata);

    metadata.props.forEach((prop) => {
        if (hasCrudFieldFeature(metadata.class, prop.name, "sort")) {
            if (prop.primary) {
                // primary only on root level
                crudSortProps.push(prop.name);
            } else if ((prop.kind == "1:1" || prop.kind == "m:1") && prop.targetMeta) {
                // add nested from relations, one level deep
                crudSortProps.push(...directSortProps(prop.targetMeta).map((nestedProp) => `${prop.name}.${nestedProp}`));
                return true;
            }
        }
    });

    return crudSortProps;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDedicatedResolverArgProps(metadata: EntityMetadata<any>) {
    return metadata.props.filter((prop) => {
        if (hasCrudFieldFeature(metadata.class, prop.name, "dedicatedResolverArg")) {
            if (prop.kind == "m:1") {
                return true;
            } else {
                console.warn(`${metadata.className} ${prop.name} can't use dedicatedResolverArg as it's not a m:1 relation`);
                return false;
            }
        }
        return false;
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildOptions(metadata: EntityMetadata<any>, generatorOptions: CrudGeneratorOptions) {
    const { classNameSingular, classNamePlural, fileNameSingular, fileNamePlural } = buildNameVariants(metadata);

    const dedicatedResolverArgProps = buildDedicatedResolverArgProps(metadata);

    const crudSearchPropNames = getCrudSearchFieldsFromMetadata(metadata);
    const hasSearchArg = crudSearchPropNames.length > 0;

    const crudFilterProps = buildFilterProps(metadata);
    const hasFilterArg = crudFilterProps.length > 0;

    const crudSortProps = buildSortProps(metadata);
    const hasSortArg = crudSortProps.length > 0;

    const hasSlugProp = metadata.props.some((prop) => prop.name == "slug");

    const scopeProp = metadata.props.find((prop) => prop.name == "scope");
    if (scopeProp && !scopeProp.targetMeta) {
        throw new Error("Scope prop has no targetMeta");
    }

    const hasDeletedAtProp = metadata.props.some((prop) => prop.name == "deletedAt");

    const hasPositionProp = metadata.props.some((prop) => prop.name == "position");

    const positionGroupPropNames: string[] = hasPositionProp
        ? (generatorOptions.position?.groupByFields ?? [
              ...(scopeProp ? [scopeProp.name] : []), // if there is a scope prop it's effecting position-group, if not groupByFields should be used
          ])
        : [];
    const positionGroupProps = hasPositionProp ? metadata.props.filter((prop) => positionGroupPropNames.includes(prop.name)) : [];

    const scopedEntity = Reflect.getMetadata(SCOPED_ENTITY_METADATA_KEY, metadata.class);
    const skipScopeCheck = !scopeProp && !scopedEntity;

    const argsClassName = `${classNameSingular != classNamePlural ? classNamePlural : `${classNamePlural}List`}Args`;
    const argsFileName = `${fileNameSingular != fileNamePlural ? fileNamePlural : `${fileNameSingular}-list`}.args`;

    const hasPaging = generatorOptions.paging !== false;
    const hasArgsClass = hasPaging || !!scopeProp || dedicatedResolverArgProps.length > 0;

    const blockProps = metadata.props.filter((prop) => {
        return hasCrudFieldFeature(metadata.class, prop.name, "input") && prop.type === "RootBlockType";
    });

    const targetDirectory = `${dirname(metadata.path).replace(/\/entities$/, "")}/generated`;

    return {
        crudSearchPropNames,
        hasSearchArg,
        crudFilterProps,
        hasFilterArg,
        crudSortProps,
        hasSortArg,
        hasSlugProp,
        hasPositionProp,
        positionGroupProps,
        hasDeletedAtProp,
        scopeProp,
        skipScopeCheck,
        argsClassName,
        argsFileName,
        hasPaging,
        hasArgsClass,
        blockProps,
        dedicatedResolverArgProps,
        targetDirectory,
    };
}
