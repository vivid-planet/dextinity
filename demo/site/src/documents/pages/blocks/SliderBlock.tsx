import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { SliderBlockData } from "@src/blocks.generated";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import {
    Carousel,
    CarouselDots,
    CarouselNextButton,
    CarouselPreviousButton,
    CarouselSlide,
    CarouselStatus,
    CarouselViewport,
} from "@src/common/components/Carousel";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import { AnimateGroup } from "@src/util/animations/AnimateGroup";
import clsx from "clsx";
import { useIntl } from "react-intl";

import styles from "./SliderBlock.module.scss";

type SliderBlockProps = PropsWithData<SliderBlockData>;

export const SliderBlock = withPreview(
    ({ data: { sliderList } }: SliderBlockProps) => {
        const intl = useIntl();

        return (
            <AnimateGroup>
                <PageLayout>
                    <Carousel
                        label={intl.formatMessage({ id: "sliderBlock.ariaLabel", defaultMessage: "Slider" })}
                        slideCount={sliderList.blocks.length}
                        className={styles.carousel}
                    >
                        <CarouselPreviousButton className={clsx(styles.navigationButton, styles["navigationButton--previous"])} />
                        <CarouselViewport>
                            {sliderList.blocks.map((block, index) => (
                                <CarouselSlide key={block.key} index={index}>
                                    <AnimateBoxInOnScroll direction="left" delay={100 * index}>
                                        <div className={styles.sliderItemBlockRoot}>
                                            <div className={styles.mediaWrapper}>
                                                <MediaBlock data={block.props.media} fill aspectRatio="16x9" sizes="50vw" />
                                            </div>
                                            <RichTextBlock data={block.props.text} />
                                        </div>
                                    </AnimateBoxInOnScroll>
                                </CarouselSlide>
                            ))}
                        </CarouselViewport>
                        <CarouselNextButton className={clsx(styles.navigationButton, styles["navigationButton--next"])} />
                        <CarouselStatus className={styles.status} />
                        <CarouselDots className={styles.dots} dotClassName={styles.dot} selectedDotClassName={styles["dot--selected"]} />
                    </Carousel>
                </PageLayout>
            </AnimateGroup>
        );
    },
    { label: "Slider" },
);
