export interface TranslatableInterface<
    Input extends Record<string, unknown> = Record<string, unknown>,
    Output extends Record<string, unknown> = Input,
> {
    translateContent: (input: Input, translate: (text: string) => Promise<string>) => Promise<Output>;
}
