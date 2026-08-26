export interface DominantColorCalculatorInterface {
    calculateDominantColor(contentHash: string): Promise<string | undefined>;
}
