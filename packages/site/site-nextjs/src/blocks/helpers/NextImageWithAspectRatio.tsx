"use client";

import { generateImageUrl } from "@dextinity/site-react";
// eslint-disable-next-line no-restricted-imports
import NextImageImport, { type ImageProps } from "next/image";

// `next/image` is a CJS module; under Next.js Pages Router its default import
// from this ESM package yields the module-namespace object instead of the
// component (Node-style ESM↔CJS interop). Unwrap so the component works under
// both bundler-style and Node-style interop.
const NextImage: typeof NextImageImport = (NextImageImport as unknown as { default?: typeof NextImageImport }).default ?? NextImageImport;

interface NextImageWithAspectRatioProps extends ImageProps {
    aspectRatio: number;
}

// The loader is a function, which can't be passed from a server component to a client component, so it's created here.
export function NextImageWithAspectRatio({ aspectRatio, ...imageProps }: NextImageWithAspectRatioProps) {
    return <NextImage loader={(loaderProps) => generateImageUrl(loaderProps, aspectRatio)} {...imageProps} />;
}
