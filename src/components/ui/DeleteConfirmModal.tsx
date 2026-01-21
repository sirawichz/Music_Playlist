import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  playlistName: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  playlistName,
  isLoading = false,
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
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
            className="fixed inset-0 z-[10002] bg-black/80"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[10003] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#282828] p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-500/20 p-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white">ลบเพลย์ลิสต์?</h2>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="rounded-full p-1 text-[#a7a7a7] hover:bg-[#3e3e3e] hover:text-white transition-all disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6 space-y-2">
              <p className="text-white">
                คุณแน่ใจหรือไม่ที่จะลบเพลย์ลิสต์{' '}
                <span className="font-bold">"{playlistName}"</span>?
              </p>
              <p className="text-sm text-[#a7a7a7]">
                การดำเนินการนี้ไม่สามารถย้อนกลับได้ เพลงทั้งหมดในเพลย์ลิสต์จะถูกลบ
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-full bg-transparent border border-[#a7a7a7] px-8 py-3 text-sm font-bold text-white hover:border-white hover:scale-[1.04] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 rounded-full bg-red-500 px-8 py-3 text-sm font-bold text-white hover:scale-[1.04] hover:bg-red-600 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
              >
                {isLoading ? 'กำลังลบ...' : 'ลบเพลย์ลิสต์'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
