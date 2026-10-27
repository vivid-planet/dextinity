import { z } from "zod";

const phoneNumberPattern = /^\+?[0-9\s]+$/;

export const phoneNumber = z.string().regex(phoneNumberPattern, "Invalid phone number");

/** Like `IsLinkTarget` of `@dextinity/cms-api`: no `javascript:` or `data:` targets, `mailto:` and `tel:` need a valid address or number */
export const linkTarget = z.string().refine((value) => {
    const lowerCaseValue = value.toLowerCase();
    if (lowerCaseValue.includes("javascript:") || lowerCaseValue.includes("data:")) {
        return false;
    }
    if (value.startsWith("mailto:")) {
        return z.email().safeParse(value.slice("mailto:".length)).success;
    }
    if (value.startsWith("tel:")) {
        return phoneNumberPattern.test(value.slice("tel:".length));
    }
    return /^[a-z][a-z0-9+.-]*:\/\/[^\s/?#]+[^\s]*$/i.test(value);
}, "Invalid link target");
