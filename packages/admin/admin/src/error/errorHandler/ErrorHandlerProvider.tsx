import { createContext, type ErrorInfo, type PropsWithChildren, useContext } from "react";

interface ErrorHandlerContextValue {
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

const ErrorHandlerContext = createContext<ErrorHandlerContextValue>({});

export function ErrorHandlerProvider({ children, onError }: PropsWithChildren<ErrorHandlerContextValue>) {
    return <ErrorHandlerContext.Provider value={{ onError }}>{children}</ErrorHandlerContext.Provider>;
}

export const useErrorHandler = () => {
    return useContext(ErrorHandlerContext);
};
