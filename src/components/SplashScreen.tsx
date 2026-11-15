import { useEffect, useState } from 'react';

// Same cream as the video's own background, so the video blends into the page with no visible edge.
const GROUND = '#F2EFE8';

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
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-500 ease-in-out"
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
                    // Full frame: the pen sweeps across the whole screen before it writes the logo.
                    // On phones (portrait) it is scaled up so the logo is a readable size.
                    className="block h-full w-full object-cover portrait:h-auto portrait:w-[200vw] portrait:max-w-none portrait:object-contain"
                />
            )}
        </div>
    );
};

export default SplashScreen;
