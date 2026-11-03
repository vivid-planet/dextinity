"use client";

import { BasicSwiper } from "@src/common/components/BasicSwiper";
import type { ReactNode } from "react";
import { Pagination } from "swiper/modules";
import { SwiperSlide } from "swiper/react";

interface SliderSwiperProps {
    slides: Array<{ key: string; content: ReactNode }>;
}

export function SliderSwiper({ slides }: SliderSwiperProps) {
    return (
        <BasicSwiper
            slidesPerView={3}
            spaceBetween={20}
            longSwipesRatio={0.1}
            modules={[Pagination]}
            pagination={{ clickable: true }}
            threshold={3}
            allowTouchMove
            watchOverflow
            autoHeight
        >
            {slides.map((slide) => (
                <SwiperSlide key={slide.key}>{slide.content}</SwiperSlide>
            ))}
        </BasicSwiper>
    );
}
