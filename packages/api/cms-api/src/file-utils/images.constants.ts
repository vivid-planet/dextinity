const WEBP = "image/webp";
const PNG = "image/png";
export const JPEG = "image/jpeg";
const GIF = "image/gif";

export const BASIC_TYPES = [JPEG, PNG, GIF];

export const MODERN_TYPES = [/* AVIF, */ WEBP];

export const ALL_TYPES = [...BASIC_TYPES, ...MODERN_TYPES];
