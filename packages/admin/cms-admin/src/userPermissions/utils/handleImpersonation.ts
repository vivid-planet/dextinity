import Cookies from "js-cookie";

export const startImpersonation = async (userId: string) => {
    Cookies.set("dextinity-impersonate-user-id", userId);
    location.href = "/";
};

export const stopImpersonation = async () => {
    Cookies.remove("dextinity-impersonate-user-id");
    location.href = "/";
};
