export abstract class CommandRunner {
    abstract run(passedParams: string[], options: object): Promise<void>;
}
