import { damDefaultAcceptedMimetypes } from "../../server/common/dam-default-accepted-mimetypes.js";
import { getDamFileCategory } from "../../server/common/dam-file-category.js";

export const pixelImageMimetypes = damDefaultAcceptedMimetypes.filter((mimetype) => getDamFileCategory(mimetype) === "pixelImage");

export const svgImageMimetypes = damDefaultAcceptedMimetypes.filter((mimetype) => getDamFileCategory(mimetype) === "svgImage");

export const videoMimetypes = ["video/mp4", "video/webm"];
