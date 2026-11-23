import { SvgIcon, type SvgIconProps } from "@mui/material";

export function AiModeIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props} viewBox="0 0 20 20">
            <path
                d="M6.40971 0H13.5903C15.8191 0 16.6273 0.232064 17.4421 0.667832C18.2569 1.1036 18.8964 1.74307 19.3322 2.55789C19.7679 3.3727 20 4.18092 20 6.40971V13.5903C20 15.8191 19.7679 16.6273 19.3322 17.4421C18.8964 18.2569 18.2569 18.8964 17.4421 19.3322C16.6273 19.7679 15.8191 20 13.5903 20H6.40971C4.18092 20 3.3727 19.7679 2.55789 19.3322C1.74307 18.8964 1.1036 18.2569 0.667832 17.4421C0.232064 16.6273 0 15.8191 0 13.5903V6.40971C0 4.18092 0.232064 3.3727 0.667832 2.55789C1.1036 1.74307 1.74307 1.1036 2.55789 0.667832C3.3727 0.232064 4.18092 0 6.40971 0Z"
                fill="url(#aiModeIconBackground)"
            />
            <path
                d="M12.3906 10C12.3906 8.67969 11.3203 7.60938 10 7.60938H8.9375V12.3906H10C11.3203 12.3906 12.3906 11.3203 12.3906 10ZM13.7188 10C13.7188 12.0538 12.0538 13.7188 10 13.7188H7.60938V7.60938H6.01562V15.3125H10C12.934 15.3125 15.3125 12.934 15.3125 10C15.3125 7.06599 12.934 4.6875 10 4.6875H8.9375V6.28125H10C12.0538 6.28125 13.7188 7.94619 13.7188 10ZM16.6406 10C16.6406 13.6675 13.6675 16.6406 10 16.6406H4.6875V6.28125H7.60938V3.35938H10C13.6675 3.35938 16.6406 6.33248 16.6406 10Z"
                fill="white"
            />
            <rect opacity="0.3" x="7.60938" y="7.60938" width="1.32812" height="1.32812" fill="url(#aiModeIconShadowBelow)" />
            <rect opacity="0.3" width="1.32812" height="1.32812" transform="matrix(1 0 0 -1 7.60938 6.28125)" fill="url(#aiModeIconShadowAbove)" />
            <defs>
                <linearGradient id="aiModeIconBackground" x1="1.09375" y1="18.7695" x2="19.1016" y2="1.25" gradientUnits="userSpaceOnUse">
                    <stop offset="0.5" stopColor="#5039BF" />
                    <stop offset="1" stopColor="#EE7248" />
                </linearGradient>
                <linearGradient id="aiModeIconShadowBelow" x1="8.27344" y1="7.60938" x2="8.27344" y2="8.9375" gradientUnits="userSpaceOnUse">
                    <stop />
                    <stop offset="1" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="aiModeIconShadowAbove" x1="0.664062" y1="0" x2="0.664063" y2="1.32812" gradientUnits="userSpaceOnUse">
                    <stop />
                    <stop offset="1" stopOpacity="0" />
                </linearGradient>
            </defs>
        </SvgIcon>
    );
}
