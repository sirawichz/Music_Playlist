import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaylistStore } from '../../stores/playlistStore';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import type { Song } from '../../types';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

export function AddToPlaylistModal({ isOpen, onClose, song }: AddToPlaylistModalProps) {
  const { playlists, addSongToPlaylist, createPlaylist, isSyncing } = usePlaylistStore();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlaylistId(null);
    }
  }, [isOpen]);

  const handleCreatePlaylist = async (name: string, description?: string) => {
    await createPlaylist(name, description);
    setIsCreateModalOpen(false);
  };

  const handleAddToPlaylist = async () => {
    if (!song || !selectedPlaylistId) return;

    await addSongToPlaylist(selectedPlaylistId, song);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !song) return null;

  // กรอง playlists (ไม่รวม "Liked Songs")
  const userPlaylists = playlists.filter(p => p.id !== 'playlist_liked');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/80"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[10001] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#282828] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#3e3e3e] p-6">
              <h2 className="text-xl font-bold text-white">เพิ่มเข้าเพลย์ลิสต์</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-[#a7a7a7] hover:bg-[#3e3e3e] hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Song Info */}
            <div className="flex items-center gap-3 border-b border-[#3e3e3e] p-4">
              <img
                src={song.albumArtUrl}
                alt={song.albumName}
                className="h-12 w-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">{song.songTitle}</p>
                <p className="truncate text-xs text-[#a7a7a7]">{song.artistName}</p>
              </div>
            </div>

            {/* Playlists List */}
            <div className="max-h-[400px] overflow-y-auto p-4">
              {userPlaylists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 rounded-full bg-[#3e3e3e] p-4">
                    <Plus className="h-8 w-8 text-[#a7a7a7]" />
                  </div>
                  <p className="text-sm text-white mb-2">ยังไม่มีเพลย์ลิสต์</p>
                  <p className="text-xs text-[#a7a7a7] mb-6">สร้างเพลย์ลิสต์แรกของคุณ</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-full bg-[var(--color-spotify-green)] px-6 py-3 text-sm font-bold text-black hover:scale-[1.04] hover:bg-[#1ed760] active:scale-100 transition-all"
                  >
                    สร้างเพลย์ลิสต์
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userPlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => setSelectedPlaylistId(playlist.id)}
                      className={`w-full flex items-center gap-3 rounded-md p-3 text-left transition-all ${
                        selectedPlaylistId === playlist.id
                          ? 'bg-[var(--color-spotify-green)]/20 border border-[var(--color-spotify-green)]'
                          : 'hover:bg-[#3e3e3e]'
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-[#3e3e3e] flex-shrink-0">
                        {playlist.coverImageUrl ? (
                          <img
                            src={playlist.coverImageUrl}
                            alt={playlist.name}
                            className="h-full w-full object-cover rounded"
                          />
                        ) : (
                          <svg className="h-6 w-6 text-[#a7a7a7]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 3h15v15.167a3.5 3.5 0 11-3.5-3.5H19V5H8v13.167a3.5 3.5 0 11-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 101.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 101.5 1.5v-1.5z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-white">{playlist.name}</p>
                        <p className="text-xs text-[#a7a7a7]">{playlist.songCount} เพลง</p>
                      </div>
                      {selectedPlaylistId === playlist.id && (
                        <div className="h-4 w-4 rounded-full bg-[var(--color-spotify-green)] flex items-center justify-center flex-shrink-0">
                          <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {userPlaylists.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-[#3e3e3e] p-6">
                {/* Create New Playlist Button */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-full bg-transparent border border-[#a7a7a7] px-6 py-3 text-sm font-bold text-white hover:border-white hover:scale-[1.04] active:scale-100 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  สร้างเพลย์ลิสต์ใหม่
                </button>

                {/* Add to Selected Playlist */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-full bg-transparent border border-[#a7a7a7] px-8 py-3 text-sm font-bold text-white hover:border-white hover:scale-[1.04] active:scale-100 transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleAddToPlaylist}
                    disabled={!selectedPlaylistId || isSyncing}
                    className="flex-1 rounded-full bg-[var(--color-spotify-green)] px-8 py-3 text-sm font-bold text-black hover:scale-[1.04] hover:bg-[#1ed760] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                  >
                    {isSyncing ? 'กำลังเพิ่ม...' : 'เพิ่มเพลง'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Create Playlist Modal */}
          <CreatePlaylistModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreatePlaylist}
            isLoading={isSyncing}
          />
        </>
      )}
    </AnimatePresence>
  );
}
