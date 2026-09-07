import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { SliderBlockData } from "@src/blocks.generated";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { BasicSwiper } from "@src/common/components/BasicSwiper";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import { animateGroup } from "@src/util/animations/AnimateGroup";
import clsx from "clsx";
import { Pagination } from "swiper/modules";
import { SwiperSlide } from "swiper/react";

import styles from "./SliderBlock.module.scss";

type SliderBlockProps = PropsWithData<SliderBlockData>;

export const SliderBlock = withPreview(
    ({ data: { sliderList } }: SliderBlockProps) => {
        return (
            <PageLayout>
                <div className={clsx(styles.slider, animateGroup())}>
                    <div className={styles.swiperContainer}>
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
                            {sliderList.blocks.map((block, index) => (
                                <SwiperSlide key={block.key}>
                                    <AnimateBoxInOnScroll direction="left" delay={100 * index}>
                                        <div className={styles.sliderItemBlockRoot}>
                                            <div className={styles.mediaWrapper}>
                                                <MediaBlock data={block.props.media} fill aspectRatio="16x9" sizes="50vw" />
                                            </div>
                                            <RichTextBlock data={block.props.text} />
                                        </div>
                                    </AnimateBoxInOnScroll>
                                </SwiperSlide>
                            ))}
                        </BasicSwiper>
                    </div>
                </div>
            </PageLayout>
        );
    },
    { label: "Slider" },
);
