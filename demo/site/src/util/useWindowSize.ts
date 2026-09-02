import { useEffect, useState } from "react";

interface WindowSize {
    width: number;
    height: number;
}

export const useWindowSize = (): WindowSize | undefined => {
    const [windowSize, setWindowSize] = useState<WindowSize>();

    useEffect(() => {
        const getSize = (): WindowSize => ({
            width: window.innerWidth,
            height: window.innerHeight,
        });

        setWindowSize(getSize());

        const handleResize = () => {
            setWindowSize(getSize());
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return windowSize;
};
