"use client";

import dynamic from "next/dynamic";

// Loads react-hook-form and the Base UI form fields only on pages that contain a contact form
export const LazyContactFormBlock = dynamic(() => import("./ContactFormBlock").then((module) => module.ContactFormBlock));
