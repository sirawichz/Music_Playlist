import { Play, Pause, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatDuration } from '../../lib/utils';
import type { Song } from '../../types';
import './SongCard.css';

interface SongCardProps {
    song: Song;
    isPlaying?: boolean;
    onPlay: () => void;
    onAddToPlaylist?: () => void;
    className?: string;
}

export function SongCard({
    song,
    isPlaying = false,
    onPlay,
    onAddToPlaylist,
    className,
}: SongCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
                'group flex items-center gap-4 rounded-md p-3',
                'hover-card cursor-pointer',
                className
            )}
            onClick={onPlay}
            title={isPlaying ? 'หยุดชั่วคราว' : 'เล่น'}
        >
            {/* Album Art */}
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                <img
                    src={song.albumArtUrl}
                    alt={song.albumName}
                    className="h-full w-full object-cover"
                />
                {/* Play overlay */}
                <div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center bg-black/50',
                        'opacity-0 transition-opacity duration-200',
                        'group-hover:opacity-100',
                        isPlaying && 'opacity-100'
                    )}
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5 text-white" fill="white" />
                    ) : (
                        <Play className="h-5 w-5 text-white" fill="white" />
                    )}
                </div>

                {/* Playing indicator */}
                {isPlaying && (
                    <div className="absolute bottom-1 right-1 flex gap-0.5">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-0.5 bg-[var(--color-spotify-green)] playing-bar"
                                style={{
                                    height: '8px',
                                    animationDelay: `${i * 0.2}s`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
                <p
                    className={cn(
                        'truncate text-sm font-medium',
                        isPlaying ? 'text-[var(--color-spotify-green)]' : 'text-white'
                    )}
                >
                    {song.songTitle}
                </p>
                <p className="truncate text-xs text-[var(--color-spotify-light-gray)]">
                    {song.artistName}
                </p>
            </div>

            {/* Duration */}
            <span className="text-xs text-[var(--color-spotify-light-gray)]">
                {formatDuration(song.durationMs)}
            </span>

            {/* Add to Playlist Button */}
            {onAddToPlaylist && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist();
                    }}
                    className={cn(
                        'rounded-full p-2 opacity-0 group-hover:opacity-100',
                        'text-[var(--color-spotify-light-gray)] hover:text-white',
                        'hover:bg-[var(--color-spotify-gray)] transition-all duration-200'
                    )}
                    title="เพิ่มเข้าเพลย์ลิสต์"
                >
                    <Plus className="h-5 w-5" />
                </button>
            )}
        </motion.div>
    );
}
