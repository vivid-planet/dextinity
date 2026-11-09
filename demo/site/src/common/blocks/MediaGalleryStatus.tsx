"use client";

import { CarouselStatus } from "@src/common/components/carousel/Carousel";
import { Typography } from "@src/common/components/Typography";

export const MediaGalleryStatus = ({ className }: { className?: string }) => (
    <CarouselStatus as={Typography} variant="paragraph300" className={className} />
);
