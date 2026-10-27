export const focalPoints = ["SMART", "CENTER", "NORTHWEST", "NORTHEAST", "SOUTHWEST", "SOUTHEAST"] as const;

export type FocalPoint = (typeof focalPoints)[number];
