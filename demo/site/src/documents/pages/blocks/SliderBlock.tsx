import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { SliderBlockData } from "@src/blocks.generated";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import { AnimateGroup } from "@src/util/animations/AnimateGroup";

import styles from "./SliderBlock.module.scss";
import { SliderSwiper } from "./SliderSwiper";

type SliderBlockProps = PropsWithData<SliderBlockData>;

export const SliderBlock = withPreview(
    ({ data: { sliderList } }: SliderBlockProps) => {
        return (
            <AnimateGroup>
                <PageLayout>
                    <div className={styles.slider}>
                        <div className={styles.swiperContainer}>
                            <SliderSwiper
                                slides={sliderList.blocks.map((block, index) => ({
                                    key: block.key,
                                    content: (
                                        <AnimateBoxInOnScroll direction="left" delay={100 * index}>
                                            <div className={styles.sliderItemBlockRoot}>
                                                <div className={styles.mediaWrapper}>
                                                    <MediaBlock data={block.props.media} fill aspectRatio="16x9" sizes="50vw" />
                                                </div>
                                                <RichTextBlock data={block.props.text} />
                                            </div>
                                        </AnimateBoxInOnScroll>
                                    ),
                                }))}
                            />
                        </div>
                    </div>
                </PageLayout>
            </AnimateGroup>
        );
    },
    { label: "Slider" },
);
