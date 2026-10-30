import "swiper/css";
import "swiper/css/a11y";
import "swiper/css/keyboard";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useIntl } from "react-intl";
import { A11y, Keyboard, Navigation } from "swiper/modules";
import { Swiper, type SwiperProps } from "swiper/react";

export const BasicSwiper = ({ children, modules = [], ...restProps }: SwiperProps) => {
    const intl = useIntl();
    return (
        <Swiper
            a11y={{
                firstSlideMessage: intl.formatMessage({
                    defaultMessage: "This is the first slide",
                    id: "swiper.prevButton.firstSlide.ariaLabel",
                }),
                lastSlideMessage: intl.formatMessage({
                    defaultMessage: "This is the last slide",
                    id: "swiper.nextButton.lastSlide.ariaLabel",
                }),
                nextSlideMessage: intl.formatMessage({ defaultMessage: "Next slide", id: "swiper.nextButton.ariaLabel" }),
                paginationBulletMessage: intl.formatMessage(
                    {
                        defaultMessage: "Go to slide {index}",
                        id: "swiper.paginationBullet.ariaLabel",
                    },
                    { index: "{{index}}" }, // Swiper replaces {{index}} with the actual index
                ),
                prevSlideMessage: intl.formatMessage({ defaultMessage: "Previous slide", id: "swiper.prevButton.ariaLabel" }),
            }}
            keyboard={{ enabled: true }}
            navigation={{ enabled: true }}
            modules={[...modules, A11y, Keyboard, Navigation]}
            {...restProps}
        >
            {children}
        </Swiper>
    );
};
