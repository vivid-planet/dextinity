export const EXCLUDE_FROM_SEARCH_METADATA_KEY = "data:excludeFromSearch";

export function ExcludeFromSearch(): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        Reflect.defineMetadata(EXCLUDE_FROM_SEARCH_METADATA_KEY, true, target.constructor, propertyKey);
    };
}
