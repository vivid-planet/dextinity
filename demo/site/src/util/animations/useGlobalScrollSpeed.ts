import { useEffect, useState } from "react";

const listeners: Set<(speed: number) => void> = new Set();
let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
let lastTime = Date.now();
let measuredSpeed = 0;
let publishedSpeed = 0;
let animationFrame: number | null = null;
let idleTimeout: ReturnType<typeof setTimeout> | null = null;

const speedBucketSize = 5;
const maxSpeed = 40;
const idleDelay = 150;

/**
 * Consumers only branch on coarse thresholds and scale by the ratio to them, so the speed is published in buckets.
 * A continuous value would re-render every subscriber — and rebuild its IntersectionObserver — on every scroll event.
 */
function toBucket(speed: number) {
    if (speed <= 2) {
        return 0;
    }
    return Math.min(Math.round(speed / speedBucketSize) * speedBucketSize, maxSpeed);
}

function publish() {
    animationFrame = null;
    const speed = toBucket(measuredSpeed);
    if (speed === publishedSpeed) {
        return;
    }
    publishedSpeed = speed;
    listeners.forEach((cb) => cb(speed));
}

function onScroll() {
    const now = Date.now();
    const newY = window.scrollY;
    const deltaY = Math.abs(newY - lastScrollY);
    const deltaTime = now - lastTime;
    measuredSpeed = deltaY / (deltaTime || 1);
    lastScrollY = newY;
    lastTime = now;

    // At most one update per frame, instead of one per scroll event.
    if (animationFrame === null) {
        animationFrame = requestAnimationFrame(publish);
    }

    // Scrolling stops without a final event, so fall back to zero explicitly.
    if (idleTimeout !== null) {
        clearTimeout(idleTimeout);
    }
    idleTimeout = setTimeout(() => {
        idleTimeout = null;
        measuredSpeed = 0;
        publish();
    }, idleDelay);
}

export function useGlobalScrollSpeed() {
    const [speed, setSpeed] = useState(0);

    useEffect(() => {
        // Only add event listener if this is the first listener
        if (listeners.size === 0) {
            lastScrollY = window.scrollY;
            lastTime = Date.now();
            window.addEventListener("scroll", onScroll, { passive: true });
        }

        // Use Set to prevent duplicates
        listeners.add(setSpeed);

        return () => {
            listeners.delete(setSpeed);
            // Remove event listener when no more listeners
            if (listeners.size === 0) {
                window.removeEventListener("scroll", onScroll);
                if (animationFrame !== null) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
                if (idleTimeout !== null) {
                    clearTimeout(idleTimeout);
                    idleTimeout = null;
                }
                measuredSpeed = 0;
                publishedSpeed = 0;
            }
        };
    }, []);

    return speed;
}
