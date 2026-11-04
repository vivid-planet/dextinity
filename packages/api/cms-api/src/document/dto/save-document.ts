import type { DocumentInterface } from "./document-interface";

export type SaveDocument<T extends DocumentInterface & { createdAt?: Date }> = Omit<T, "updatedAt" | "createdAt">;
