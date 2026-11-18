export const SEARCHABLE_METADATA_KEY = "data:searchable";

export function Searchable(searchable = true): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        Reflect.defineMetadata(SEARCHABLE_METADATA_KEY, searchable, target.constructor, propertyKey);
    };
}
