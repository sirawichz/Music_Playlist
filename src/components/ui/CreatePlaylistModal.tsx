/**
 * Create Playlist Modal Component
 * Modal สำหรับสร้าง playlist ใหม่ - สไตล์ Spotify
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

export function CreatePlaylistModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    await onCreate(name.trim(), description.trim() || undefined);
    
    // Close modal after successful creation
    if (!isLoading) {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">สร้างเพลย์ลิสต์ใหม่</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-[var(--color-spotify-light-gray)] hover:bg-[#3e3e3e] hover:text-white transition-colors"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Playlist Name */}
              <div>
                <label htmlFor="playlist-name" className="mb-2 block text-sm font-medium text-white">
                  ชื่อเพลย์ลิสต์ <span className="text-red-500">*</span>
                </label>
                <input
                  id="playlist-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น เพลงโปรดของฉัน"
                  className="w-full rounded-md bg-[#1a1a1a] px-4 py-3 text-white placeholder:text-[var(--color-spotify-light-gray)] focus:outline-none focus:ring-2 focus:ring-white"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Description (Optional) */}
              <div>
                <label htmlFor="playlist-description" className="mb-2 block text-sm font-medium text-white">
                  คำอธิบาย (ไม่บังคับ)
                </label>
                <textarea
                  id="playlist-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="เพิ่มคำอธิบายให้เพลย์ลิสต์ของคุณ"
                  rows={3}
                  className="w-full rounded-md bg-[#1a1a1a] px-4 py-3 text-white placeholder:text-[var(--color-spotify-light-gray)] focus:outline-none focus:ring-2 focus:ring-white resize-none"
                  disabled={isLoading}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-transparent px-6 py-2.5 text-sm font-bold text-white hover:bg-[#3e3e3e] transition-colors"
                  disabled={isLoading}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || isLoading}
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black hover:scale-105 hover:bg-[#f0f0f0] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  {isLoading ? 'กำลังสร้าง...' : 'สร้าง'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
