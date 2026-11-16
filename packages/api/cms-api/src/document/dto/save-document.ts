import type { DocumentInterface } from "./document-interface.js";

export type SaveDocument<T extends DocumentInterface & { createdAt?: Date }> = Omit<T, "updatedAt" | "createdAt">;
