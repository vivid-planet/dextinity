function svgDataUri(svg: string) {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** A wide landscape with a sun at about 56 % / 34 %, a good subject for focal-point crops. */
export const landscapeImage = svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b8acb"/><stop offset="0.7" stop-color="#b4bdf2"/></linearGradient></defs>
<rect width="1200" height="800" fill="url(#s)"/>
<circle cx="670" cy="270" r="96" fill="#fde3fb"/>
<path d="M0 560 C220 470 420 430 640 500 S1000 560 1200 470 L1200 800 L0 800 Z" fill="#8b4a3f"/>
<path d="M0 670 C260 610 520 600 760 650 S1060 690 1200 640 L1200 800 L0 800 Z" fill="#572a1c"/>
</svg>`,
);

/** A tall portrait-format image. */
export const portraitImage = svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4e9f6"/><stop offset="1" stop-color="#d9bfe0"/></linearGradient></defs>
<rect width="800" height="1000" fill="url(#b)"/>
<ellipse cx="400" cy="880" rx="250" ry="40" fill="#a98cae"/>
<rect x="250" y="0" width="300" height="860" rx="40" fill="#3d2a38"/>
<rect x="290" y="70" width="220" height="250" rx="16" fill="#c45bc0"/>
<circle cx="400" cy="640" r="50" fill="#f2dcef"/>
</svg>`,
);

/** An interior scene, e.g. an image with a missing alt text. */
export const interiorImage = svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
<rect width="1200" height="900" fill="#efe6d2"/>
<rect x="100" y="0" width="1000" height="560" fill="#eef5df"/>
<rect x="380" y="0" width="30" height="560" fill="#d9ccb0"/><rect x="790" y="0" width="30" height="560" fill="#d9ccb0"/>
<circle cx="380" cy="560" r="120" fill="#33557f"/><circle cx="600" cy="520" r="130" fill="#0f8a86"/><circle cx="820" cy="560" r="120" fill="#36395c"/>
<rect x="210" y="680" width="780" height="110" rx="8" fill="#4d3d24"/>
</svg>`,
);

/** The first page of a document, as a PDF thumbnail would show it. */
export const documentImage = svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
<rect width="600" height="800" fill="#ffffff"/>
<rect x="60" y="70" width="240" height="24" fill="#22252b"/>
${Array.from({ length: 14 }, (_, index) => `<rect x="60" y="${140 + index * 36}" width="${index % 4 === 3 ? 300 : 480}" height="10" fill="#9aa0aa"/>`).join("")}
<rect x="60" y="680" width="200" height="60" fill="#c9d3f5"/>
</svg>`,
);
