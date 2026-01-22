import { useRef, useEffect } from 'react';
import {
    Play, Pause, SkipBack, SkipForward,
    Volume2, VolumeX, Volume1
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import { cn, formatTime } from '../../lib/utils';

export function AudioPlayer() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        togglePlay,
        nextSong,
        previousSong,
        setCurrentTime,
        setDuration,
        setVolume,
        toggleMute,
    } = useAudioPlayerStore();

    // Handle audio source and playback
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // ถ้าไม่มีเพลงหรือไม่มี preview URL
        if (!currentSong?.audioPreviewUrl) {
            audio.pause();
            return;
        }

        // เปลี่ยน source เมื่อเพลงเปลี่ยน
        if (audio.src !== currentSong.audioPreviewUrl) {
            audio.src = currentSong.audioPreviewUrl;
            audio.load();
        }

        // Play หรือ Pause ตาม state
        if (isPlaying) {
            // ใช้ Promise และจัดการ AbortError
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    // Ignore AbortError - เกิดเมื่อเปลี่ยนเพลงระหว่าง play
                    if (error.name === 'AbortError') {

                        return;
                    }
                    console.error('Playback error:', error);
                });
            }
        } else {
            audio.pause();
        }
    }, [isPlaying, currentSong?.id, currentSong?.audioPreviewUrl]);

    // Handle volume changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        nextSong();
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !audioRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const VolumeIcon = isMuted || volume === 0
        ? VolumeX
        : volume < 0.5
            ? Volume1
            : Volume2;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <AnimatePresence>
            {currentSong && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className={cn(
                        'fixed bottom-0 left-0 right-0 z-50',
                        'bg-[var(--color-spotify-dark-gray)] border-t border-[var(--color-spotify-gray)]',
                        'px-4 py-3'
                    )}
                >
                    <audio
                        ref={audioRef}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleEnded}
                    />

                    <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4">
                        {/* Song Info */}
                        <div className="flex items-center gap-3 w-1/4 min-w-0">
                            <img
                                src={currentSong.albumArtUrl}
                                alt={currentSong.albumName}
                                className="h-14 w-14 rounded object-cover"
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                    {currentSong.songTitle}
                                </p>
                                <p className="truncate text-xs text-[var(--color-spotify-light-gray)]">
                                    {currentSong.artistName}
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col items-center gap-2 w-2/4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={previousSong}
                                    className="text-[var(--color-spotify-light-gray)] hover:text-white transition-colors"
                                >
                                    <SkipBack className="h-5 w-5" fill="currentColor" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-full',
                                        'bg-white text-black hover:scale-105 transition-transform'
                                    )}
                                >
                                    {isPlaying ? (
                                        <Pause className="h-4 w-4" fill="currentColor" />
                                    ) : (
                                        <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                                    )}
                                </button>

                                <button
                                    onClick={nextSong}
                                    className="text-[var(--color-spotify-light-gray)] hover:text-white transition-colors"
                                >
                                    <SkipForward className="h-5 w-5" fill="currentColor" />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex w-full items-center gap-2">
                                <span className="text-xs text-[var(--color-spotify-light-gray)] w-10 text-right">
                                    {formatTime(currentTime)}
                                </span>
                                <div
                                    ref={progressRef}
                                    onClick={handleProgressClick}
                                    className="group relative h-1 flex-1 cursor-pointer rounded-full bg-[var(--color-spotify-gray)]"
                                >
                                    <div
                                        className="absolute h-full rounded-full bg-white group-hover:bg-[var(--color-spotify-green)] transition-colors"
                                        style={{ width: `${progress}%` }}
                                    />
                                    <div
                                        className={cn(
                                            'absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white',
                                            'opacity-0 group-hover:opacity-100 transition-opacity'
                                        )}
                                        style={{ left: `calc(${progress}% - 6px)` }}
                                    />
                                </div>
                                <span className="text-xs text-[var(--color-spotify-light-gray)] w-10">
                                    {formatTime(duration)}
                                </span>
                            </div>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-2 w-1/4 justify-end">
                            <button
                                onClick={toggleMute}
                                className="text-[var(--color-spotify-light-gray)] hover:text-white transition-colors"
                            >
                                <VolumeIcon className="h-5 w-5" />
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className={cn(
                                    'w-24 h-1 rounded-full appearance-none cursor-pointer',
                                    'bg-[var(--color-spotify-gray)]',
                                    '[&::-webkit-slider-thumb]:appearance-none',
                                    '[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3',
                                    '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white'
                                )}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
