type Placeholder = {
    preview: string;
    mail: string;
};

const getPreviewHtml = (previewText: string) => {
    return `<code style="background-color: rgba(41, 182, 246, 0.1); outline: 1px solid rgb(41, 182, 246)">${previewText}</code>`;
};

export const replaceMailHtmlPlaceholders = (html: string, type: "mail" | "preview") => {
    let newHtml = html;
    const placeholders: Record<string, Placeholder> = {
        "{{SALUTATION}}": {
            mail: [
                '{% if ( contact.LASTNAME ) and (contact.SALUTATION == "MALE" ) %}',
                `Dear Mr. {{contact.LASTNAME}} `,
                '{% elif ( contact.LASTNAME ) and ( contact.SALUTATION == "FEMALE" ) %}',
                `Dear Ms. {{contact.LASTNAME}}`,
                "{% elif ( contact.LASTNAME )%}",
                `Dear Mr./Ms. {{contact.LASTNAME}}`,
                "{% else %}",
                "Dear Ladies and Gentlemen",
                "{% endif %}",
            ].join(""),

            preview: getPreviewHtml("Dear Ladies and Gentlemen "),
        },
    };
    for (const placeholder in placeholders) {
        newHtml = newHtml.replace(new RegExp(placeholder, "g"), placeholders[placeholder][type]);
    }

    return newHtml;
};
