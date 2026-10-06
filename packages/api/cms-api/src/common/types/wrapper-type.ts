/**
 * Wraps the type of a constructor parameter or property that is part of a circular import.
 *
 * With `emitDecoratorMetadata`, TypeScript references a class type directly in the emitted `design:*` metadata, which throws a
 * `ReferenceError` in ESM when the class's module hasn't finished evaluating yet. A type alias is emitted as `Object` instead.
 * Use together with `forwardRef()`, as Nest can't resolve the dependency from the emitted metadata anymore.
 */
export type WrapperType<T> = T;
