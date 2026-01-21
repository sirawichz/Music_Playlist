import { useState, useEffect } from 'react';
import { Bell, Settings, LogOut, User } from 'lucide-react';
import { useMusicSearch } from './hooks/useMusicSearch';
import { useAudioPlayerStore } from './stores/audioPlayerStore';
import { useAuthStore } from './stores/authStore';
import { Sidebar } from './components/layout/Sidebar';
import { NowPlayingPanel } from './components/layout/NowPlayingPanel';
import { SearchBar } from './components/ui/SearchBar';
import { SongCard } from './components/ui/SongCard';
import { MusicCard } from './components/ui/MusicCard';
import { AudioPlayer } from './components/player/AudioPlayer';
import { AuthModal } from './components/auth/AuthModal';
import { 
  mockRecentlyPlayed, 
  mockRadioStations, 
  mockPopularArtists, 
  mockPopularAlbums, 
  mockUserMixes,
  mockRecentListening 
} from './services/mockSpotify';
import type { Song, Playlist } from './types';

function App() {
  const { query, results, isLoading, error, setQuery, clearResults } = useMusicSearch();
  const { currentSong, isPlaying, setQueue, addToQueue } = useAudioPlayerStore();
  const { 
    user, 
    profile, 
    isLoading: authLoading, 
    initialize, 
    openAuthModal, 
    signOut 
  } = useAuthStore();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Get user display info
  const userDisplayName = profile?.display_name || user?.email?.split('@')[0] || 'ผู้ใช้';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  const handlePlaySong = (_song: Song, index: number, songs: Song[]) => {
    setQueue(songs, index);
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue(song);
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  };

  // Show search results or home content
  const showSearchResults = query.length > 0 || results.length > 0;

  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Top Header - Full Width */}
      <header className="flex h-[100px] items-center gap-6 px-6 py-[30px] bg-black">
        {/* Spotify Logo */}
        <a href="#" className="flex items-center gap-2 flex-shrink-0">
          <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span className="text-xl font-bold text-white tracking-tight">Spotify</span>
        </a>

        {/* Search Bar with Home button */}
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={clearResults}
          isLoading={isLoading}
        />

            {/* Right Actions */}
            <div className="flex flex-shrink-0 items-center gap-2">
              {/* Premium Button */}
              <button className="h-[38px] rounded-[15px] bg-white px-[10px] py-[1px] text-sm font-bold text-black hover:scale-[1.04] hover:bg-[#f0f0f0] active:scale-100 active:bg-[#e0e0e0] transition-all duration-200">
                สำรวจ Premium
              </button>
              
              {/* Install App Button */}
              <button className="h-8 flex items-center gap-2 rounded-full px-3 text-sm font-bold text-white hover:scale-[1.04] active:scale-100 transition-all duration-200">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.995 8.745a.75.75 0 0 1 1.06 0L7.25 9.939V4a.75.75 0 0 1 1.5 0v5.94l1.195-1.195a.75.75 0 1 1 1.06 1.06L8 12.811l-.528-.528-.005-.005-2.472-2.473a.75.75 0 0 1 0-1.06" />
                  <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13" />
                </svg>
                <span>ติดตั้งแอพ</span>
              </button>

              {/* Icon Buttons Group */}
              <div className="flex items-center gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#a7a7a7] hover:text-white hover:scale-[1.04] active:scale-100 transition-all duration-200">
                  <Bell className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#a7a7a7] hover:text-white hover:scale-[1.04] active:scale-100 transition-all duration-200">
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              {/* User Avatar / Login */}
              {user ? (
                <div className="relative ml-1">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6437] text-black font-bold text-sm hover:scale-[1.04] active:scale-100 transition-all duration-200"
                    title={userDisplayName}
                  >
                    {userInitial}
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-[9998]" 
                        onClick={() => setShowUserMenu(false)} 
                      />
                      {/* Menu */}
                      <div className="absolute right-0 top-full mt-2 z-[9999] w-48 rounded-md bg-[#282828] py-1 shadow-xl">
                        <div className="border-b border-[#3e3e3e] px-4 py-3">
                          <p className="text-sm font-bold text-white truncate">{userDisplayName}</p>
                          <p className="text-xs text-[#a7a7a7] truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#a7a7a7] hover:bg-[#3e3e3e] hover:text-white"
                        >
                          <User className="h-4 w-4" />
                          โปรไฟล์
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            signOut();
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#a7a7a7] hover:bg-[#3e3e3e] hover:text-white"
                        >
                          <LogOut className="h-4 w-4" />
                          ออกจากระบบ
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => openAuthModal('login')}
                  disabled={authLoading}
                  className="flex h-8 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black hover:scale-[1.04] hover:bg-[#f0f0f0] active:scale-100 transition-all duration-200 ml-1"
                >
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 gap-2 p-2 overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar
            onPlaylistSelect={handlePlaylistSelect}
            selectedPlaylistId={selectedPlaylist?.id || null}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-[var(--color-spotify-black)] rounded-lg p-6">

          {/* Filter Tabs - Always visible at top */}
          <div className="mt-2 mb-8 flex gap-2">
            <button className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-black hover:scale-[1.02] active:scale-100 active:bg-[#b3b3b3] transition-all duration-200">
              ทั้งหมด
            </button>
            <button className="rounded-full bg-[#232323] px-3.5 py-1.5 text-sm font-medium text-white hover:bg-[#2a2a2a] hover:scale-[1.02] active:scale-100 active:bg-[#181818] transition-all duration-200">
              เพลง
            </button>
            <button className="rounded-full bg-[#232323] px-3.5 py-1.5 text-sm font-medium text-white hover:bg-[#2a2a2a] hover:scale-[1.02] active:scale-100 active:bg-[#181818] transition-all duration-200">
              พอดแคสต์
            </button>
          </div>

          {/* Content Area */}
          {showSearchResults ? (
            /* Search Results */
            <div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-lg bg-red-500/20 p-4 text-red-400">
                  <p className="font-medium">Error: {error}</p>
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-white">
                    ผลการค้นหา
                  </h2>
                  <div className="rounded-lg bg-[var(--color-spotify-dark-gray)]/50 p-2">
                    {results.map((song, index) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        isPlaying={currentSong?.id === song.id && isPlaying}
                        onPlay={() => handlePlaySong(song, index, results)}
                        onAddToPlaylist={() => handleAddToQueue(song)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-spotify-gray)] border-t-[var(--color-spotify-green)]" />
                  <p className="mt-4 text-[var(--color-spotify-light-gray)]">กำลังค้นหา...</p>
                </div>
              )}

              {/* No Results */}
              {query && !isLoading && results.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-xl text-white">ไม่พบผลลัพธ์</p>
                  <p className="text-[var(--color-spotify-light-gray)]">
                    ลองค้นหาเพลงหรือศิลปินอื่น
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Home Content */
            <div className="space-y-10">
              {/* Section: แนะนำสำหรับวันนี้ */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">แนะนำสำหรับวันนี้</h2>
                  <button className="text-sm font-bold text-[var(--color-spotify-light-gray)] hover:underline">
                    แสดงทั้งหมด
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {mockRecentlyPlayed.map((song, index) => (
                    <MusicCard
                      key={song.id}
                      song={song}
                      onPlay={() => handlePlaySong(song, index, mockRecentlyPlayed)}
                      isPlaying={currentSong?.id === song.id && isPlaying}
                    />
                  ))}
                </div>
              </section>

              {/* Section: สถานีวิทยุยอดนิยม */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">สถานีวิทยุยอดนิยม</h2>
                  <button className="text-sm font-bold text-[var(--color-spotify-light-gray)] hover:underline">
                    แสดงทั้งหมด
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {mockRadioStations.map((station) => (
                    <div
                      key={station.id}
                      className="group relative cursor-pointer overflow-hidden rounded-lg transition-all hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${station.gradientFrom} 0%, ${station.gradientTo} 100%)`,
                      }}
                    >
                      {/* Spotify badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <svg className="h-5 w-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                      </div>
                      {/* วิทยุ badge */}
                      <div className="absolute top-2 right-2 z-10 rounded bg-black/30 px-1.5 py-0.5 text-xs text-white">
                        วิทยุ
                      </div>
                      {/* Content */}
                      <div className="relative aspect-square p-4 flex flex-col justify-end">
                        {/* Image overlay */}
                        <img
                          src={station.imageUrl}
                          alt={station.name}
                          className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-overlay"
                        />
                        <div className="relative z-10">
                          <h3 className="text-xl font-bold text-white drop-shadow-lg">
                            {station.name}
                          </h3>
                        </div>
                      </div>
                      {/* Description */}
                      <div className="bg-black/20 px-4 py-3">
                        <p className="text-xs text-white/80 line-clamp-2">
                          กับ {station.artists.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section: เล่นล่าสุด */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">เล่นล่าสุด</h2>
                  <button className="text-sm font-bold text-[var(--color-spotify-light-gray)] hover:underline">
                    แสดงทั้งหมด
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {mockRecentlyPlayed.slice().reverse().map((song, index) => (
                    <MusicCard
                      key={`recent-${song.id}`}
                      song={song}
                      onPlay={() => handlePlaySong(song, index, mockRecentlyPlayed.slice().reverse())}
                      isPlaying={currentSong?.id === song.id && isPlaying}
                    />
                  ))}
                </div>
              </section>

              {/* Section: ศิลปินยอดนิยม */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">ศิลปินยอดนิยม</h2>
                  <button className="text-sm font-bold text-[var(--color-spotify-light-gray)] hover:underline">
                    แสดงทั้งหมด
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {mockPopularArtists.map((artist) => (
                    <div
                      key={artist.id}
                      className="group flex cursor-pointer flex-col items-center rounded-md bg-[var(--color-spotify-dark-gray)] p-4 transition-all hover:bg-[var(--color-spotify-gray)]"
                    >
                      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-full shadow-lg">
                        <img
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="truncate w-full text-center font-bold text-white">
                        {artist.name}
                      </h3>
                      <p className="text-sm text-[var(--color-spotify-light-gray)]">
                        ศิลปิน
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section: อัลบั้มและซิงเกิลยอดนิยม */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">อัลบั้มและซิงเกิลยอดนิยม</h2>
                  <button className="text-sm font-bold text-[var(--color-spotify-light-gray)] hover:underline">
                    แสดงทั้งหมด
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {mockPopularAlbums.map((album) => (
                    <div
                      key={album.id}
                      className="group flex cursor-pointer flex-col rounded-md bg-[var(--color-spotify-dark-gray)] p-4 transition-all hover:bg-[var(--color-spotify-gray)]"
                    >
                      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md shadow-lg">
                        <img
                          src={album.imageUrl}
                          alt={album.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="truncate font-bold text-white">
                        {album.name}
                      </h3>
                      <p className="text-sm text-[var(--color-spotify-light-gray)]">
                        {album.artistName}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section: มิกซ์ยอดนิยมของคุณ */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">มิกซ์ยอดนิยมของคุณ</h2>
                  <button className="text-sm font-bold text-[var(--color-spotify-light-gray)] hover:underline">
                    แสดงทั้งหมด
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {mockUserMixes.map((mix) => (
                    <div
                      key={mix.id}
                      className="group flex cursor-pointer flex-col rounded-md bg-[var(--color-spotify-dark-gray)] p-4 transition-all hover:bg-[var(--color-spotify-gray)]"
                    >
                      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md shadow-lg">
                        <img
                          src={mix.imageUrl}
                          alt={mix.name}
                          className="h-full w-full object-cover"
                        />
                        {/* Mix badge */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 p-2"
                          style={{ background: `linear-gradient(transparent, ${mix.color})` }}
                        >
                          <span className="text-xs font-bold text-white">{mix.name}</span>
                        </div>
                      </div>
                      <h3 className="truncate font-bold text-white">
                        {mix.name}
                      </h3>
                      <p className="text-xs text-[var(--color-spotify-light-gray)] line-clamp-2">
                        {mix.artists.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section: ตามการฟังล่าสุดของคุณ */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">ตามการฟังล่าสุดของคุณ</h2>
                  <button className="text-sm font-bold text-[var(--color-spotify-light-gray)] hover:underline">
                    แสดงทั้งหมด
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {mockRecentListening.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="group flex cursor-pointer flex-col rounded-md bg-[var(--color-spotify-dark-gray)] p-4 transition-all hover:bg-[var(--color-spotify-gray)]"
                    >
                      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md shadow-lg">
                        <img
                          src={playlist.imageUrl}
                          alt={playlist.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="truncate font-bold text-white">
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-[var(--color-spotify-light-gray)] line-clamp-2">
                        {playlist.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* Right Panel - Now Playing */}
        <div className="flex-shrink-0">
          <NowPlayingPanel
            currentSong={currentSong}
            isPlaying={isPlaying}
          />
        </div>
      </div>

      {/* Bottom Audio Player */}
      <AudioPlayer />

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
}

export default App;
