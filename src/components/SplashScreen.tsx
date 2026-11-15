import { useEffect, useState } from 'react';

// Same cream as the video's own background, so its edges disappear into the page.
const GROUND = '#F2EFE9';
const EDGE_FADE = 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent), linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [phase, setPhase] = useState<'in' | 'out'>('in');
    const [videoFailed, setVideoFailed] = useState(false);

    useEffect(() => {
        // The logo animation runs 6 s. Fade out as it finishes; if the video cannot play, show the static logo briefly.
        const outAt = videoFailed ? 2200 : 5600;
        const holdTimer = setTimeout(() => setPhase('out'), outAt);
        const doneTimer = setTimeout(() => onFinish(), outAt + 600);
        return () => {
            clearTimeout(holdTimer);
            clearTimeout(doneTimer);
        };
    }, [onFinish, videoFailed]);

    const skip = () => {
        setPhase('out');
        setTimeout(onFinish, 400);
    };

    return (
        <div
            role="img"
            aria-label="Harry The Blaze"
            onClick={skip}
            className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ease-in-out"
            style={{
                background: GROUND,
                opacity: phase === 'out' ? 0 : 1,
                pointerEvents: phase === 'out' ? 'none' : 'auto',
            }}
        >
            {videoFailed ? (
                <img src="/logo.svg" alt="" className="w-72 md:w-96" />
            ) : (
                <video
                    src="/logo-intro.mp4"
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onError={() => setVideoFailed(true)}
                    className="block w-[min(92vw,820px)]"
                    style={{
                        aspectRatio: '2 / 1',
                        WebkitMaskImage: EDGE_FADE,
                        maskImage: EDGE_FADE,
                        WebkitMaskComposite: 'source-in',
                        maskComposite: 'intersect',
                    }}
                />
            )}
        </div>
    );
};

export default SplashScreen;
