import "swiper/css";
import "swiper/css/navigation";

import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { MediaGalleryBlockData } from "@src/blocks.generated";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { Typography } from "@src/common/components/Typography";
import { PageLayout } from "@src/layout/PageLayout";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Navigation } from "swiper/modules";
import { SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";

import { BasicSwiper } from "../components/BasicSwiper";
import styles from "./MediaGalleryBlock.module.scss";

type MediaGalleryBlockProps = PropsWithData<MediaGalleryBlockData>;

export const MediaGalleryBlock = withPreview(
    ({ data }: MediaGalleryBlockProps) => {
        const [swiper, setSwiper] = useState<SwiperClass | null>(null);
        const [activeItem, setActiveItem] = useState(0);
        const nextButtonRef = useRef<HTMLButtonElement | null>(null);
        const prevButtonRef = useRef<HTMLButtonElement | null>(null);

        const intl = useIntl();

        useEffect(() => {
            if (!swiper) {
                return;
            }

            const updateInert = () => {
                swiper.slides.forEach((slide, index) => {
                    if (index === swiper.activeIndex) {
                        slide.removeAttribute("inert");
                    } else {
                        slide.setAttribute("inert", "");
                    }
                });
            };

            updateInert();
        }, [swiper, activeItem]);

        return (
            <>
                <button
                    ref={prevButtonRef}
                    className={clsx(styles.navigationButton, styles["navigationButton--previous"])}
                    aria-label={intl.formatMessage({ id: "mediaGalleryBlock.prevSlide", defaultMessage: "Previous slide" })}
                    disabled={activeItem === 0}
                />
                <BasicSwiper
                    className={styles.swiper}
                    slidesPerView={1}
                    slidesPerGroup={1}
                    modules={[Navigation]}
                    navigation={{ prevEl: prevButtonRef.current, nextEl: nextButtonRef.current }}
                    longSwipesRatio={0.1}
                    threshold={3}
                    allowTouchMove
                    watchOverflow
                    speed={400}
                    onSwiper={setSwiper}
                    onSlideChange={(swiper) => {
                        setActiveItem(swiper.activeIndex);
                    }}
                >
                    {data.items.blocks.map((block) => (
                        <SwiperSlide key={block.key}>
                            <MediaBlock data={block.props.media} aspectRatio={data.aspectRatio} />
                            <Typography variant="paragraph200" className={styles.mediaCaption}>
                                {block.props.caption}
                            </Typography>
                        </SwiperSlide>
                    ))}
                </BasicSwiper>
                <Typography variant="paragraph300" className={styles.customPagination} role="status" aria-live="polite" aria-atomic="true">
                    <FormattedMessage
                        id="mediaGalleryBlock.pagination"
                        defaultMessage="{current} of {total}"
                        values={{ current: activeItem + 1, total: data.items.blocks.length }}
                    />
                </Typography>
                <button
                    ref={nextButtonRef}
                    className={clsx(styles.navigationButton, styles["navigationButton--next"])}
                    aria-label={intl.formatMessage({ id: "mediaGalleryBlock.nextSlide", defaultMessage: "Next slide" })}
                    disabled={activeItem === data.items.blocks.length - 1}
                />
            </>
        );
    },
    { label: "MediaGallery" },
);

export const PageContentMediaGalleryBlock = (props: MediaGalleryBlockProps) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <MediaGalleryBlock {...props} />
        </div>
    </PageLayout>
);
