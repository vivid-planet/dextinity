import type { FunctionComponent } from "react";

type FullPageAlertBackgroundProps = {
    className?: string;
};

export const FullPageAlertBackground: FunctionComponent<FullPageAlertBackgroundProps> = ({ className }) => {
    return (
        <svg viewBox="0 0 1680 1050" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className={className}>
            <rect width="1680" height="1050" fill="#F2F2F2" />
            <g opacity="0.6">
                <mask id="mask0_10745_23417" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="-1" y="510" width="1682" height="540">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M-0.000244141 1050L1680 1050L1680 510.3L-0.000244141 510.3L-0.000244141 1050Z"
                        fill="white"
                    />
                </mask>
                <g mask="url(#mask0_10745_23417)">
                    <g style={{ mixBlendMode: "multiply" }}>
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1680 851.62L732.48 1050L1680 1050V851.62Z"
                            fill="url(#paint0_linear_10745_23417)"
                        />
                    </g>
                    <g style={{ mixBlendMode: "multiply" }}>
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1481.76 1050L0.000244141 589.878L672 1050H1481.76Z"
                            fill="url(#paint1_linear_10745_23417)"
                        />
                    </g>
                    <g style={{ mixBlendMode: "multiply" }}>
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M221.76 1050L0.000408173 589.878L672 1050H221.76Z"
                            fill="url(#paint2_linear_10745_23417)"
                        />
                    </g>
                    <g style={{ mixBlendMode: "multiply" }}>
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1261 1050L1116 510.3L1680 1050H1261Z"
                            fill="url(#paint3_linear_10745_23417)"
                        />
                    </g>
                    <g style={{ mixBlendMode: "multiply" }}>
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1680 750.167L876 530.289L1680 1050L1680 750.167Z"
                            fill="url(#paint4_linear_10745_23417)"
                        />
                    </g>
                    <g style={{ mixBlendMode: "multiply" }}>
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M290.641 1050L1162.56 683.411L697.201 1050H290.641Z"
                            fill="url(#paint5_linear_10745_23417)"
                        />
                    </g>
                    <g style={{ mixBlendMode: "multiply" }}>
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M-0.00012207 876.512L1538.88 540.095L-0.00012207 1012.29V876.512Z"
                            fill="url(#paint6_linear_10745_23417)"
                        />
                    </g>
                </g>
            </g>
            <defs>
                <linearGradient id="paint0_linear_10745_23417" x1="1680" y1="1050" x2="1680" y2="851.62" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F2F2F2" />
                    <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient id="paint1_linear_10745_23417" x1="1481.76" y1="1050" x2="1481.76" y2="589.878" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F2F2F2" />
                    <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient id="paint2_linear_10745_23417" x1="0.000427246" y1="1050" x2="672" y2="1050" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F2F2F2" />
                    <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient id="paint3_linear_10745_23417" x1="1680" y1="1050" x2="1680" y2="510.3" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F2F2F2" />
                    <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient id="paint4_linear_10745_23417" x1="1680" y1="1050" x2="1680" y2="530.289" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F2F2F2" />
                    <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient id="paint5_linear_10745_23417" x1="1162.56" y1="1050" x2="1162.56" y2="683.411" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F2F2F2" />
                    <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient id="paint6_linear_10745_23417" x1="1538.88" y1="1012.29" x2="1538.88" y2="540.095" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F2F2F2" />
                    <stop offset="1" stopColor="white" />
                </linearGradient>
            </defs>
        </svg>
    );
};
