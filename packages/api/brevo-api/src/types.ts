import type { ContentScope } from "@dextinity/cms-api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BrevoContactAttributesInterface = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BrevoContactFilterAttributesInterface = Record<string, Array<any> | undefined>;

export type EmailCampaignScopeInterface = Partial<ContentScope>;
