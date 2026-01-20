// Song type from iTunes API mapping
export interface Song {
    id: string;
    songTitle: string;
    artistName: string;
    albumName: string;
    albumArtUrl: string;
    audioPreviewUrl: string | null;
    durationMs: number;
    releaseDate: string;
    genre: string;
}

// Playlist type
export interface Playlist {
    id: string;
    name: string;
    description: string;
    coverImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
    songCount: number;
}

// PlaylistSong junction type
export interface PlaylistSong {
    id: string;
    playlistId: string;
    songId: string;
    addedAt: string;
    position: number;
    song?: Song;
}

// User profile type
export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    createdAt: string;
}

// Audio player state
export interface AudioPlayerState {
    currentSong: Song | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    queue: Song[];
    queueIndex: number;
}

// Search state
export interface SearchState {
    query: string;
    results: Song[];
    isLoading: boolean;
    error: string | null;
}

// iTunes API response types
export interface ITunesSearchResponse {
    resultCount: number;
    results: ITunesTrack[];
}

export interface ITunesTrack {
    trackId: number;
    trackName: string;
    artistName: string;
    collectionName: string;
    artworkUrl100: string;
    previewUrl?: string;
    trackTimeMillis: number;
    releaseDate: string;
    primaryGenreName: string;
}
