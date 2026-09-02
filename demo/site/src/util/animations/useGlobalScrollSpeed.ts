import { useEffect, useRef, useState } from "react";

const listeners: Set<(speed: number) => void> = new Set();
let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
let lastTime = Date.now();

function notifyListeners(speed: number) {
    listeners.forEach((cb) => cb(speed));
}

function onScroll() {
    const now = Date.now();
    const newY = window.scrollY;
    const deltaY = Math.abs(newY - lastScrollY);
    const deltaTime = now - lastTime;
    const speed = deltaY / (deltaTime || 1);
    notifyListeners(speed);
    lastScrollY = newY;
    lastTime = now;
}

export function useGlobalScrollSpeed() {
    const [speed, setSpeed] = useState(0);
    const setSpeedRef = useRef(setSpeed);

    useEffect(() => {
        // Update ref to always have the latest callback
        setSpeedRef.current = setSpeed;
    }, [setSpeed]);

    useEffect(() => {
        const callback = (newSpeed: number) => {
            setSpeedRef.current(newSpeed);
        };

        // Only add event listener if this is the first listener
        if (listeners.size === 0) {
            lastScrollY = window.scrollY;
            lastTime = Date.now();
            window.addEventListener("scroll", onScroll, { passive: true });
        }

        // Use Set to prevent duplicates
        listeners.add(callback);

        return () => {
            listeners.delete(callback);
            // Remove event listener when no more listeners
            if (listeners.size === 0) {
                window.removeEventListener("scroll", onScroll);
            }
        };
    }, []);

    return speed;
}
