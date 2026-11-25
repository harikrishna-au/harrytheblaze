import { useEffect, useState } from 'react';

// Same cream as the video's own background, so the video blends into the page with no visible edge.
const GROUND = '#F2EFE8';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [phase, setPhase] = useState<'in' | 'out'>('in');
    const [videoFailed, setVideoFailed] = useState(false);

    useEffect(() => {
        // The logo animation runs 6 s, played at 4x so it finishes in about 1.5 s: first-time visitors
        // from an ad were sitting through six seconds of a blank screen. If the video cannot play,
        // show the static logo briefly.
        const outAt = videoFailed ? 1000 : 1700;
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
            // The landing page starts its entrance when the splash begins to fade.
            data-splash=""
            data-leaving={phase === 'out' ? '' : undefined}
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
                    onLoadedMetadata={(e) => { e.currentTarget.playbackRate = 4; }}
                    // Full frame: the pen sweeps across the whole screen before it writes the logo.
                    // On phones (portrait) it is scaled up so the logo is a readable size.
                    className="block h-full w-full object-cover portrait:h-auto portrait:w-[200vw] portrait:max-w-none portrait:object-contain"
                />
            )}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); skip(); }}
                className="absolute bottom-6 right-5 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#15140f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15140f]"
            >
                Skip
            </button>
        </div>
    );
};

export default SplashScreen;
