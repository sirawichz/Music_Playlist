import { Music2, Github } from 'lucide-react';
import { useMusicSearch } from './hooks/useMusicSearch';
import { useAudioPlayerStore } from './stores/audioPlayerStore';
import { SearchBar } from './components/ui/SearchBar';
import { SongCard } from './components/ui/SongCard';
import { AudioPlayer } from './components/player/AudioPlayer';
import type { Song } from './types';

function App() {
  const { query, results, isLoading, error, setQuery, clearResults } = useMusicSearch();
  const { currentSong, isPlaying, setSong, setQueue, addToQueue } = useAudioPlayerStore();

  const handlePlaySong = (song: Song, index: number) => {
    // Set the queue with all results and start from clicked song
    setQueue(results, index);
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue(song);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-spotify-gray)] to-[var(--color-spotify-black)]">
      {/* Header */}
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-spotify-green)]">
              <Music2 className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Music Playlist
            </span>
          </div>

          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={clearResults}
            isLoading={isLoading}
          />

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-spotify-light-gray)] hover:text-white transition-colors"
          >
            <Github className="h-6 w-6" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-screen-xl px-6 py-8 pb-32">
        {/* Welcome Section */}
        {!query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-spotify-green)] to-[var(--color-spotify-green-light)]">
              <Music2 className="h-12 w-12 text-black" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-white">
              Welcome to Music Playlist
            </h1>
            <p className="text-lg text-[var(--color-spotify-light-gray)]">
              Search for your favorite songs and create playlists
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/20 p-4 text-red-400">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm">Please try again or check your connection.</p>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">
              Search Results
            </h2>
            <div className="rounded-lg bg-[var(--color-spotify-dark-gray)]/50 p-2">
              {results.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  isPlaying={currentSong?.id === song.id && isPlaying}
                  onPlay={() => handlePlaySong(song, index)}
                  onAddToPlaylist={() => handleAddToQueue(song)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-spotify-gray)] border-t-[var(--color-spotify-green)]" />
            <p className="mt-4 text-[var(--color-spotify-light-gray)]">
              Searching...
            </p>
          </div>
        )}

        {/* No Results */}
        {query && !isLoading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl text-white">No results found</p>
            <p className="text-[var(--color-spotify-light-gray)]">
              Try searching for a different song or artist
            </p>
          </div>
        )}
      </main>

      {/* Audio Player */}
      <AudioPlayer />
    </div>
  );
}

export default App;
