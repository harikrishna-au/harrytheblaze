import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Volume2, Loader2 } from 'lucide-react';
import { backendFetch } from '@/lib/backendAuth';

interface AudioPlayerProps {
    text: string;
    voiceType?: string;
    audioUrl?: string; // Static S3 URL
    onPlayComplete?: () => void;
    playOnce?: boolean;
    speechRate?: number; // 0.5 (slow) to 2.0 (fast), default 1.0
}

/**
 * Player lifecycle:  loading → ready → playing → played   (playOnce)
 *                                     ↖ playing ↙          (replayable)
 * A new question (text / audioUrl change) starts a new "generation"; anything still in flight
 * from the previous question (a TTS fetch, an audio/speech end event) is ignored.
 */
type PlayerState = 'loading' | 'ready' | 'playing' | 'played';

/** Fetches TTS audio for `text`; resolves to a blob URL, or null to use the browser voice. */
async function fetchTtsUrl(text: string, voiceType: string): Promise<string | null> {
    try {
        // Use environment variable for backend URL
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
        const response = await backendFetch(`${backendUrl}/api/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg'
            },
            body: JSON.stringify({ text, voice_type: voiceType })
        });

        if (!response.ok) {
            console.warn('Backend TTS failed, using browser fallback');
            return null;
        }
        const data = await response.json();
        if (!data.audio_content) {
            console.warn('Backend TTS response missing audio_content');
            return null;
        }
        // Decode Base64
        const binaryString = window.atob(data.audio_content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
    } catch (error) {
        console.warn('Cannot connect to TTS service, using browser fallback:', error);
        return null;
    }
}

export function AudioPlayer({ text, voiceType = 'male_1', audioUrl: initialAudioUrl, onPlayComplete, playOnce = true, speechRate = 1.0 }: AudioPlayerProps) {
    const [state, setState] = useState<PlayerState>('loading');
    // null = no backend audio, so play with the browser's speech synthesis.
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const generationRef = useRef(0);

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();
            setVoices(available);
        };

        loadVoices();

        // Safari loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    useEffect(() => {
        // New question: stop whatever was playing and start a new generation.
        const generation = ++generationRef.current;
        audioRef.current?.pause();
        audioRef.current = null;
        window.speechSynthesis?.cancel();
        setAudioUrl(null);

        let createdUrl: string | null = null;
        if (initialAudioUrl) {
            setAudioUrl(initialAudioUrl);
            setState('ready');
        } else if (text) {
            setState('loading');
            fetchTtsUrl(text, voiceType).then((url) => {
                if (generation !== generationRef.current) {
                    // The question changed while this was loading; don't show the old audio.
                    if (url) URL.revokeObjectURL(url);
                    return;
                }
                createdUrl = url;
                setAudioUrl(url);
                // The student may already be listening via the browser voice; don't interrupt that.
                setState((s) => (s === 'loading' ? 'ready' : s));
            });
        } else {
            setState('ready');
        }

        return () => {
            // Revoke object URL only if it was created by us (blob)
            if (createdUrl) URL.revokeObjectURL(createdUrl);
        };
    }, [text, voiceType, initialAudioUrl]);

    const finishPlayback = (generation: number) => {
        if (generation !== generationRef.current) return; // ended after the question changed
        setState(playOnce ? 'played' : 'ready');
        onPlayComplete?.();
    };

    const playWithBrowserTTS = (generation: number) => {
        if (!window.speechSynthesis) {
            console.error('Browser does not support speech synthesis');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to match voice type
        // Use loaded voices from state, or fallback to direct call if state empty
        const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();

        if (voiceType.includes('female')) {
            const femaleVoice = availableVoices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google US English'));
            if (femaleVoice) utterance.voice = femaleVoice;
        } else {
            const maleVoice = availableVoices.find(v => v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Alex') || v.name.includes('Google UK English Male'));
            if (maleVoice) utterance.voice = maleVoice;
        }

        utterance.rate = speechRate;
        utterance.onstart = () => {
            if (generation === generationRef.current) setState('playing');
        };
        utterance.onend = () => finishPlayback(generation);

        window.speechSynthesis.speak(utterance);
    };

    const handlePlay = () => {
        if (state === 'playing' || state === 'played') return;
        const generation = generationRef.current;

        if (!audioUrl) {
            // Use browser's built-in speech synthesis
            playWithBrowserTTS(generation);
        } else {
            // Use backend audio
            const audio = new Audio(audioUrl);
            audio.playbackRate = speechRate;
            audioRef.current = audio;

            audio.onplay = () => {
                if (generation === generationRef.current) setState('playing');
            };
            audio.onended = () => finishPlayback(generation);

            audio.play().catch(e => {
                console.error("Audio playback interrupted/failed:", e);
                if (generation !== generationRef.current) return;
                setState('ready');
                // Try fallback if play fails (e.g., format not supported)
                playWithBrowserTTS(generation);
            });
        }
    };

    // Button is only disabled when playing or already played (if playOnce is true)
    // NOT disabled when loading - it will use fallback if backend fails
    const isLoading = state === 'loading';
    const isPlaying = state === 'playing';
    const hasPlayed = state === 'played';
    // Backend audio failed (or isn't available), so the browser voice is used.
    const usingFallback = state !== 'loading' && !audioUrl && !!text;
    const isDisabled = isPlaying || hasPlayed;

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Play Button */}
            <Button
                onClick={handlePlay}
                disabled={isDisabled}
                size="lg"
                className={`h-16 px-8 rounded-full ${isPlaying
                    ? 'bg-stone-500 hover:bg-stone-900'
                    : hasPlayed
                        ? 'bg-neutral-300 cursor-not-allowed'
                        : 'bg-stone-900 hover:bg-stone-900'
                    }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Loading Audio...
                    </>
                ) : isPlaying ? (
                    <>
                        <Volume2 className="w-6 h-6 mr-2 animate-pulse" />
                        Playing...
                    </>
                ) : hasPlayed ? (
                    <>
                        <Play className="w-6 h-6 mr-2 opacity-50" />
                        Played
                    </>
                ) : (
                    <>
                        <Play className="w-6 h-6 mr-2" />
                        Play Audio
                    </>
                )}
            </Button>

            {/* Info message if using fallback */}
            {usingFallback && !isPlaying && !hasPlayed && (
                <p className="text-xs text-neutral-500">
                    Using browser voice (backend unavailable)
                </p>
            )}
        </div>
    );
}
