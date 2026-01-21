/**
 * Auth Modal Component
 * Modal สำหรับ Login/Signup - สไตล์ Spotify
 */

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import './AuthModal.css';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    isLoading,
    error,
    successMessage,
    closeAuthModal,
    switchAuthMode,
    signIn,
    signUp,
    clearError,
    clearSuccess,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setDisplayName('');
      setShowPassword(false);
      clearError();
      clearSuccess();
    }
  }, [isAuthModalOpen, authModalMode, clearError, clearSuccess]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authModalMode === 'login') {
      await signIn(email, password);
    } else {
      await signUp(email, password, displayName);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAuthModal();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-[480px] mx-4 rounded-2xl bg-gradient-to-b from-[#242424] to-[#121212] px-12 py-10 shadow-2xl border border-white/5">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-5 top-5 rounded-full p-2 text-[#b3b3b3] hover:bg-white/10 hover:text-white transition-all duration-200"
          aria-label="ปิด"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Spotify Logo */}
        <div className="mb-8 flex justify-center">
          <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>

        {/* Title */}
        <h2 className="mb-10 text-center text-[28px] font-bold tracking-tight text-white">
          {isLogin ? 'เข้าสู่ระบบ Spotify' : 'สมัครสมาชิก Spotify'}
        </h2>

        {/* Error message */}
        {error && (
          <div className="animate-in mb-6 mx-6 flex items-center gap-4 rounded-xl bg-gradient-to-r from-[#e91429]/20 to-[#e91429]/10 border border-[#e91429]/40 px-5 py-4 shadow-lg shadow-[#e91429]/10">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#e91429] to-[#ff4757] flex items-center justify-center shadow-md">
              <X className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#ff6b7a]">{error}</p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="animate-in animate-pulse-glow mb-6 mx-6 rounded-xl bg-gradient-to-br from-[#1ed760]/25 via-[#1ed760]/15 to-[#1db954]/10 border border-[#1ed760]/50 px-6 py-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#1ed760] to-[#1db954] flex items-center justify-center shadow-lg shadow-[#1ed760]/40">
                <CheckCircle className="h-7 w-7 text-black" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-lg font-bold text-[#1ed760] mb-1">สมัครสมาชิกสำเร็จ!</p>
                <p className="text-sm text-white/90 leading-relaxed">{successMessage}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#b3b3b3] bg-white/5 rounded-lg px-3 py-2">
                  <Mail className="h-4 w-4 text-[#1ed760]" />
                  <span>อาจใช้เวลาสักครู่ กรุณาตรวจสอบในโฟลเดอร์ Spam ด้วย</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name (Signup only) */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white mx-6">
                ชื่อที่แสดง
              </label>
              <div className="group flex items-center rounded-lg border border-[#727272] bg-[#121212] transition-all duration-200 hover:border-[#b3b3b3] focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 mx-6">
                {/* Icon */}
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 text-[#a7a7a7] group-focus-within:text-white transition-colors">
                  <User className="h-5 w-5" />
                </div>
                {/* Input */}
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ชื่อที่ต้องการแสดง"
                  className="flex-1 bg-transparent py-3.5 pr-4 text-white placeholder-[#727272] outline-none"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2 my-[15px]">
            <label className="block text-sm font-semibold text-white mx-6">
              อีเมลหรือชื่อผู้ใช้
            </label>
            <div className="group flex items-center rounded-lg border border-[#727272] bg-[#121212] transition-all duration-200 hover:border-[#b3b3b3] focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 mx-6">
              {/* Icon */}
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 text-[#a7a7a7] group-focus-within:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              {/* Input */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมลหรือชื่อผู้ใช้"
                required
                className="flex-1 bg-transparent py-3.5 pr-4 text-white placeholder-[#727272] outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white mx-[20px]">
              รหัสผ่าน
            </label>
            <div className="group flex items-center rounded-lg border border-[#727272] bg-[#121212] transition-all duration-200 hover:border-[#b3b3b3] focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 mx-[20px]">
              {/* Icon */}
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 text-[#a7a7a7] group-focus-within:text-white transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              {/* Input */}
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                required
                minLength={6}
                className="flex-1 bg-transparent py-3.5 text-white placeholder-[#727272] outline-none"
              />
              {/* Show/Hide Password Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex-shrink-0 flex items-center justify-center w-12 h-12 text-[#a7a7a7] hover:text-white transition-colors"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-[#a7a7a7] mt-1">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="mx-6 mt-5 mb-5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-[#1ed760] text-base font-bold text-black transition-all duration-200 hover:scale-[1.04] hover:bg-[#1fdf64] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังดำเนินการ...
                </span>
              ) : isLogin ? (
                'เข้าสู่ระบบ'
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </div>
        </form>

        {/* Forgot Password (Login only) */}
        {isLogin && (
          <div className="mx-6 mt-4">
            <button className="w-full h-12 rounded-full border border-[#878787] text-base font-bold text-white transition-all duration-200 hover:scale-[1.04] hover:border-white hover:bg-white/5 active:scale-[0.98]">
              ลืมรหัสผ่าน?
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#404040]" />
        </div>

        {/* Switch mode link */}
        <p className="text-center text-base text-[#b3b3b3] my-[15px]">
          {isLogin ? (
            <>
              ยังไม่มีบัญชี?{' '}
              <button
                onClick={switchAuthMode}
                className="font-bold text-white underline decoration-1 underline-offset-4 hover:text-[#1ed760] transition-colors"
              >
                สมัครสมาชิก Spotify
              </button>
            </>
          ) : (
            <>
              มีบัญชีอยู่แล้ว?{' '}
              <button
                onClick={switchAuthMode}
                className="font-bold text-white underline decoration-1 underline-offset-4 hover:text-[#1ed760] transition-colors"
              >
                เข้าสู่ระบบ
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
