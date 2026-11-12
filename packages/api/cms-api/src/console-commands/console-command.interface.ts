export interface ConsoleCommandInterface {
    run(args: string[], options: object): Promise<void>;
}
