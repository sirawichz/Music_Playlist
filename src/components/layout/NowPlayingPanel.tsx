import { MoreHorizontal, X, CheckCircle2, Music } from 'lucide-react';
import type { Song } from '../../types';

interface NowPlayingPanelProps {
    currentSong: Song | null;
    isPlaying: boolean;
    onClose: () => void;
}

export function NowPlayingPanel({ currentSong, isPlaying, onClose }: NowPlayingPanelProps) {
    // Show empty state when no song is playing
    if (!currentSong) {
        return (
            <aside className="hidden w-[300px] lg:block">
                <div className="flex h-full flex-col rounded-lg bg-[#121212]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4">
                        <span className="text-sm font-bold text-white">กำลังเล่น</span>
                        <div className="flex items-center gap-1">
                            <button
                                className="text-[var(--color-spotify-light-gray)] hover:text-white transition-colors p-1"
                                onClick={onClose}
                                title="ปิดเพลงที่กำลังเล่น"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                        <div className="mb-6 rounded-full bg-[#282828] p-6">
                            <Music className="h-12 w-12 text-[#a7a7a7]" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            ยังไม่มีเพลงกำลังเล่น
                        </h3>
                        <p className="text-sm text-[#a7a7a7] max-w-[200px]">
                            ค้นหาและเล่นเพลงที่คุณชื่นชอบ
                        </p>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden w-[300px] lg:block">
            <div className="flex h-full flex-col rounded-lg bg-[#121212]">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <span className="text-sm font-bold text-white">{currentSong.albumName || 'Now Playing'}</span>
                    <div className="flex items-center gap-1">
                        <button className="text-[var(--color-spotify-light-gray)] hover:text-white transition-colors p-1">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                        <button
                            className="text-[var(--color-spotify-light-gray)] hover:text-white transition-colors p-1"
                            onClick={onClose}
                            title="ปิดเพลงที่กำลังเล่น"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Album Art */}
                <div className="px-4">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                        <img
                            src={currentSong.albumArtUrl}
                            alt={currentSong.albumName}
                            className="h-full w-full object-cover"
                        />
                        {/* Playing indicator overlay */}
                        {isPlaying && (
                            <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-spotify-green)]">
                                <div className="flex items-end gap-0.5 h-4">
                                    <span className="w-1 bg-black animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '60%' }}></span>
                                    <span className="w-1 bg-black animate-[bounce_0.5s_ease-in-out_0.1s_infinite]" style={{ height: '100%' }}></span>
                                    <span className="w-1 bg-black animate-[bounce_0.5s_ease-in-out_0.2s_infinite]" style={{ height: '40%' }}></span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Song Info */}
                <div className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-bold text-white">
                                {currentSong.songTitle}
                            </h3>
                            <p className="truncate text-sm text-[var(--color-spotify-light-gray)]">
                                {currentSong.artistName}
                            </p>
                        </div>
                        <button className="ml-2 text-[var(--color-spotify-green)]">
                            <CheckCircle2 className="h-5 w-5" fill="#1DB954" />
                        </button>
                    </div>
                </div>

                {/* About Artist Section */}
                <div className="mt-auto">
                    <div className="p-4">
                        <p className="text-sm font-bold text-white mb-3">เกี่ยวกับศิลปิน</p>
                    </div>
                    <div className="relative">
                        <img
                            src={currentSong.albumArtUrl}
                            alt={currentSong.artistName}
                            className="w-full h-32 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <p className="text-sm font-bold text-white">{currentSong.artistName}</p>
                            <p className="text-xs text-white/80">ศิลปิน</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
