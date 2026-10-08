// Prevents TypeScript from emitting the class in the decorator metadata, which would access it before initialization in an import cycle
export type WrapperType<T> = T;
