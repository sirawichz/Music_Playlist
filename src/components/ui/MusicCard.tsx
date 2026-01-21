import { Play } from 'lucide-react';
import type { Song } from '../../types';

interface MusicCardProps {
    song: Song;
    onPlay: () => void;
    isPlaying?: boolean;
}

/**
 * Card แบบ Spotify สำหรับแสดงเพลง/อัลบั้มในแนวตั้ง
 */
export function MusicCard({ song, onPlay, isPlaying }: MusicCardProps) {
    return (
        <div
            className="group relative flex cursor-pointer flex-col rounded-md bg-[var(--color-spotify-dark-gray)] p-4 transition-all hover:bg-[var(--color-spotify-gray)]"
            onClick={onPlay}
        >
            {/* Album Art */}
            <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md shadow-lg">
                <img
                    src={song.albumArtUrl}
                    alt={song.albumName}
                    className="h-full w-full object-cover"
                />
                {/* Play Button Overlay */}
                <button
                    className={`absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-spotify-green)] text-black shadow-xl transition-all ${isPlaying
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                        } hover:scale-105`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay();
                    }}
                >
                    <Play className="h-6 w-6 ml-1" fill="black" />
                </button>
            </div>

            {/* Song Info */}
            <div className="min-w-0">
                <h3 className="truncate font-bold text-white">
                    {song.songTitle}
                </h3>
                <p className="mt-1 truncate text-sm text-[var(--color-spotify-light-gray)]">
                    {song.artistName}
                </p>
            </div>
        </div>
    );
}
