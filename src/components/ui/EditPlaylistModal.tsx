import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => Promise<void>;
  playlistName: string;
  playlistDescription?: string;
  isLoading?: boolean;
}

export function EditPlaylistModal({
  isOpen,
  onClose,
  onSave,
  playlistName,
  playlistDescription = '',
  isLoading = false,
}: EditPlaylistModalProps) {
  const [name, setName] = useState(playlistName);
  const [description, setDescription] = useState(playlistDescription);

  useEffect(() => {
    if (isOpen) {
      setName(playlistName);
      setDescription(playlistDescription);
    }
  }, [isOpen, playlistName, playlistDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSave(name.trim(), description.trim() || undefined);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

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
            className="fixed left-1/2 top-1/2 z-[10001] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#282828] p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">แก้ไขเพลย์ลิสต์</h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="rounded-full p-1 text-[#a7a7a7] hover:bg-[#3e3e3e] hover:text-white transition-all disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label htmlFor="playlist-name" className="block text-sm font-medium text-white mb-2">
                  ชื่อเพลย์ลิสต์ <span className="text-red-500">*</span>
                </label>
                <input
                  id="playlist-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อเพลย์ลิสต์ของฉัน"
                  className="w-full rounded-md bg-[#3e3e3e] px-4 py-3 text-white placeholder-[#a7a7a7] outline-none focus:ring-2 focus:ring-[var(--color-spotify-green)] transition-all"
                  disabled={isLoading}
                  required
                  maxLength={100}
                />
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="playlist-description" className="block text-sm font-medium text-white mb-2">
                  คำอธิบาย (ไม่บังคับ)
                </label>
                <textarea
                  id="playlist-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="เพิ่มคำอธิบายเพลย์ลิสต์..."
                  rows={3}
                  className="w-full rounded-md bg-[#3e3e3e] px-4 py-3 text-white placeholder-[#a7a7a7] outline-none focus:ring-2 focus:ring-[var(--color-spotify-green)] transition-all resize-none"
                  disabled={isLoading}
                  maxLength={300}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-full bg-transparent border border-[#a7a7a7] px-8 py-3 text-sm font-bold text-white hover:border-white hover:scale-[1.04] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || isLoading}
                  className="flex-1 rounded-full bg-[var(--color-spotify-green)] px-8 py-3 text-sm font-bold text-black hover:scale-[1.04] hover:bg-[#1ed760] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
