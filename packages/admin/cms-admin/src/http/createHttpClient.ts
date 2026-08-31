import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export function createHttpClient(apiUrl: string): AxiosInstance {
    const headers: AxiosRequestConfig["headers"] = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "x-preview-dam-urls": "1",
    };
    const requestInterceptor = async (config: AxiosRequestConfig) => {
        config.headers = {
            ...config.headers,
            "x-include-invisible-content": ["Pages:Unpublished", "Pages:Archived", "Blocks:Invisible"],
        };
        return Promise.resolve(config);
    };

    const axiosClient = axios.create({
        baseURL: apiUrl,
        headers,
    });
    axiosClient.interceptors.request.use(requestInterceptor);

    return axiosClient;
}
