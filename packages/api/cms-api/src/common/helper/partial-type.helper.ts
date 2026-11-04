/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Type } from "@nestjs/common";
import { isFunction } from "@nestjs/common/utils/shared.utils";
import { Field } from "@nestjs/graphql";
import type { ClassDecoratorFactory } from "@nestjs/graphql/dist/interfaces/class-decorator-factory.interface";
import { METADATA_FACTORY_NAME } from "@nestjs/graphql/dist/plugin/plugin-constants.js";
import { getFieldsAndDecoratorForType } from "@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util.js";
import { applyFieldDecorators } from "@nestjs/graphql/dist/type-helpers/type-helpers.utils.js";
import { inheritPropertyInitializers, inheritTransformationMetadata, inheritValidationMetadata } from "@nestjs/mapped-types";

import { IsUndefinable } from "../validators/is-undefinable";

//Copy from @nestjs/graphql with applyIsOptionalDecorator changed to use IsUndefinable instead of IsOptional and changed defaultValue to undefined
export function PartialType<T>(classRef: Type<T>, decorator?: ClassDecoratorFactory): Type<Partial<T>> {
    const { fields, decoratorFactory } = getFieldsAndDecoratorForType(classRef);

    abstract class PartialObjectType {
        constructor() {
            inheritPropertyInitializers(this, classRef);
        }
    }
    if (decorator) {
        decorator({ isAbstract: true })(PartialObjectType);
    } else {
        decoratorFactory({ isAbstract: true })(PartialObjectType);
    }

    inheritValidationMetadata(classRef, PartialObjectType);
    inheritTransformationMetadata(classRef, PartialObjectType);

    fields.forEach((item) => {
        if (isFunction(item.typeFn)) {
            /**
             * Execute type function eagerly to update the type options object (before "clone" operation)
             * when the passed function (e.g., @Field(() => Type)) lazily returns an array.
             */
            item.typeFn();
        }
        Field(item.typeFn, { ...item.options, nullable: true, defaultValue: undefined })(PartialObjectType.prototype, item.name);
        applyIsOptionalDecorator(PartialObjectType, item.name);
        applyFieldDecorators(PartialObjectType, item);
    });

    if ((PartialObjectType as any)[METADATA_FACTORY_NAME]) {
        const pluginFields = Object.keys((PartialObjectType as any)[METADATA_FACTORY_NAME]());
        pluginFields.forEach((key) => applyIsOptionalDecorator(PartialObjectType, key));
    }

    Object.defineProperty(PartialObjectType, "name", {
        value: `Partial${classRef.name}`,
    });
    return PartialObjectType as Type<Partial<T>>;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function applyIsOptionalDecorator(targetClass: Function, propertyKey: string): void {
    //don't conditionally use class-validator (as @nestjs/mapped-types does), as we depend on it anyway
    const decoratorFactory = IsUndefinable();
    decoratorFactory(targetClass.prototype, propertyKey);
}
