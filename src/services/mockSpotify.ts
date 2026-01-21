/**
 * Mock Spotify Service
 * ใช้ระหว่างพัฒนาเมื่อยังไม่มี Spotify API credentials
 * จะถูกแทนที่ด้วย Edge Function เมื่อ setup Supabase เสร็จ
 */

import type { Song } from '../types';

// Mock access token (simulates what Edge Function would return)
export interface SpotifyTokenResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
}

// Mock artist data
export interface SpotifyArtist {
    id: string;
    name: string;
    imageUrl: string;
    followers: number;
    genres: string[];
}

// Mock featured playlists
export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    trackCount: number;
}

/**
 * Mock: Get Spotify Access Token
 * ในอนาคตจะเรียก supabase.functions.invoke('get-spotify-token')
 */
export async function getMockSpotifyToken(): Promise<SpotifyTokenResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
        accessToken: 'mock_access_token_' + Date.now(),
        tokenType: 'Bearer',
        expiresIn: 3600,
    };
}

/**
 * Radio Station type for colorful cards
 */
export interface RadioStation {
    id: string;
    name: string;
    artists: string[];
    gradientFrom: string;
    gradientTo: string;
    imageUrl?: string;
}

/**
 * Mock: Popular Radio Stations (Spotify-style with colorful gradients)
 */
export const mockRadioStations: RadioStation[] = [
    {
        id: 'radio_1',
        name: 'ยังโอม',
        artists: ['BLVCKHEART', 'Z9', 'PUN และอีกมาก'],
        gradientFrom: '#7dd3fc',
        gradientTo: '#0ea5e9',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    },
    {
        id: 'radio_2',
        name: 'Ariana Grande',
        artists: ['Justin Bieber', 'The Weeknd', 'Tate McRae และ...'],
        gradientFrom: '#fca5a5',
        gradientTo: '#ef4444',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
    },
    {
        id: 'radio_3',
        name: 'Bruno Mars',
        artists: ['Katy Perry', 'Ed Sheeran', 'Shawn Mende...'],
        gradientFrom: '#86efac',
        gradientTo: '#22c55e',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
    },
    {
        id: 'radio_4',
        name: 'ชิลลี่ ฟูลส์',
        artists: ['HANGMAN', 'แบล็คแจ็ค', 'โมเดิร์นด็อก และอีกมาก'],
        gradientFrom: '#fde047',
        gradientTo: '#eab308',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    },
    {
        id: 'radio_5',
        name: 'ค็อกเทล',
        artists: ['Musketeers', 'ป๊อบ ปองกูล', 'เบสกูม ออดิโอ และอีก...'],
        gradientFrom: '#f0abfc',
        gradientTo: '#d946ef',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    },
];

/**
 * Mock: Featured Playlists (Spotify-style)
 */
export const mockFeaturedPlaylists: SpotifyPlaylist[] = [
    {
        id: 'playlist_1',
        name: 'Today\'s Top Hits',
        description: 'The hottest tracks right now',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        trackCount: 50,
    },
    {
        id: 'playlist_2',
        name: 'Chill Vibes',
        description: 'Relax and unwind with these tracks',
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        trackCount: 40,
    },
    {
        id: 'playlist_3',
        name: 'Workout Beats',
        description: 'Energy boost for your workout',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=300&fit=crop',
        trackCount: 35,
    },
    {
        id: 'playlist_4',
        name: 'Focus Flow',
        description: 'Instrumental beats for concentration',
        imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop',
        trackCount: 60,
    },
];

/**
 * Mock: Sidebar playlists with images (like Spotify)
 */
export interface SidebarItem {
    id: string;
    name: string;
    type: 'playlist' | 'artist';
    owner?: string;
    imageUrl: string;
    songCount?: number;
}

export const mockSidebarItems: SidebarItem[] = [
    {
        id: 'sidebar_1',
        name: 'My Playlist #1',
        type: 'playlist',
        owner: 'sirawich laolam',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
        songCount: 12,
    },
    {
        id: 'sidebar_2',
        name: 'My Playlist #3',
        type: 'playlist',
        owner: 'sirawich laolam',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop',
        songCount: 8,
    },
    {
        id: 'sidebar_3',
        name: 'ผับ',
        type: 'playlist',
        owner: 'sirawich laolam',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop',
        songCount: 25,
    },
    {
        id: 'sidebar_4',
        name: 'Patrickananda',
        type: 'artist',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop',
    },
    {
        id: 'sidebar_5',
        name: 'Three Man Down',
        type: 'artist',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop',
    },
    {
        id: 'sidebar_6',
        name: 'Tilly Birds',
        type: 'artist',
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop',
    },
];

/**
 * Mock: Popular Artists (Thai & International)
 */
export const mockPopularArtists: SpotifyArtist[] = [
    {
        id: 'artist_1',
        name: 'ยังโอม',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        followers: 890000,
        genres: ['thai pop'],
    },
    {
        id: 'artist_2',
        name: 'ค็อกเทล',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        followers: 750000,
        genres: ['thai rock'],
    },
    {
        id: 'artist_3',
        name: 'F.HERO',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
        followers: 820000,
        genres: ['thai hip hop'],
    },
    {
        id: 'artist_4',
        name: 'อิ้ง ดอล',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
        followers: 450000,
        genres: ['thai pop'],
    },
    {
        id: 'artist_5',
        name: 'PUN',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        followers: 680000,
        genres: ['thai r&b'],
    },
    {
        id: 'artist_6',
        name: 'Owl',
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        followers: 320000,
        genres: ['thai pop'],
    },
];

/**
 * Mock: Popular Albums
 */
export interface Album {
    id: string;
    name: string;
    artistName: string;
    imageUrl: string;
    year: number;
}

export const mockPopularAlbums: Album[] = [
    {
        id: 'album_1',
        name: 'BANGKOK LEGACY',
        artistName: 'RAVI',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        year: 2024,
    },
    {
        id: 'album_2',
        name: 'PUN',
        artistName: 'PUN',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        year: 2024,
    },
    {
        id: 'album_3',
        name: 'Alter Ego',
        artistName: 'LISA',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
        year: 2025,
    },
    {
        id: 'album_4',
        name: 'CYANTIST',
        artistName: 'ภาณุ Mythical',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
        year: 2024,
    },
    {
        id: 'album_5',
        name: 'Yours Ever',
        artistName: 'ซังมา',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        year: 2024,
    },
];

/**
 * Mock: User Mixes
 */
export interface Mix {
    id: string;
    name: string;
    artists: string[];
    imageUrl: string;
    color: string;
}

export const mockUserMixes: Mix[] = [
    {
        id: 'mix_1',
        name: 'เดลี่มิกซ์ 1',
        artists: ['Mr.Children', 'Air Supply', 'The Cardigans และอีก...'],
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        color: '#e91e63',
    },
    {
        id: 'mix_2',
        name: 'เดลี่มิกซ์ 2',
        artists: ['Leon', 'Destiny Rogers', 'Lady Gaga และอีกมากมาย'],
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        color: '#9c27b0',
    },
    {
        id: 'mix_3',
        name: 'Ariana Grande มิกซ์',
        artists: ['Charlie Puth', 'DJ Snake', 'และ Taylor Swift'],
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
        color: '#673ab7',
    },
    {
        id: 'mix_4',
        name: 'เดลี่มิกซ์ 3',
        artists: ['LAUGS', 'Sebastian Yatra', 'สิงห์สนามชะเอม และอีกมากมาย'],
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
        color: '#3f51b5',
    },
    {
        id: 'mix_5',
        name: 'เดลี่มิกซ์ 4',
        artists: ['CNCO', 'Chino & Nacho', 'KAROL G และอีกมากมาย'],
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        color: '#2196f3',
    },
];

/**
 * Mock: Recent Listening Playlists
 */
export const mockRecentListening: SpotifyPlaylist[] = [
    {
        id: 'recent_1',
        name: 'Summer K-Pop hits',
        description: 'Be cool with refreshing Tropical K-Pop dance...',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        trackCount: 50,
    },
    {
        id: 'recent_2',
        name: 'Sad Hours K-Pop',
        description: 'Late night feelings party ห้า greatest tears. Cove...',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        trackCount: 40,
    },
    {
        id: 'recent_3',
        name: 'Yet to Come in Busan',
        description: 'Enjoy the concert! BTS EP! Including the sele...',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
        trackCount: 35,
    },
    {
        id: 'recent_4',
        name: 'pop songs we miss',
        description: 'Time to press play on these gem jams from...',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
        trackCount: 60,
    },
];

/**
 * Mock: Recently Played Songs
 * ใช้ข้อมูลที่คล้ายกับ iTunes response structure
 */
export const mockRecentlyPlayed: Song[] = [
    {
        id: 'mock_1',
        songTitle: 'Blinding Lights',
        artistName: 'The Weeknd',
        albumName: 'After Hours',
        albumArtUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioPreviewUrl: null, // Mock ไม่มี preview URL
        durationMs: 200040,
        releaseDate: '2020-03-20',
        genre: 'Pop',
    },
    {
        id: 'mock_2',
        songTitle: 'Levitating',
        artistName: 'Dua Lipa',
        albumName: 'Future Nostalgia',
        albumArtUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
        audioPreviewUrl: null,
        durationMs: 203807,
        releaseDate: '2020-03-27',
        genre: 'Pop',
    },
    {
        id: 'mock_3',
        songTitle: 'Save Your Tears',
        artistName: 'The Weeknd',
        albumName: 'After Hours',
        albumArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        audioPreviewUrl: null,
        durationMs: 215627,
        releaseDate: '2020-03-20',
        genre: 'Pop',
    },
    {
        id: 'mock_4',
        songTitle: 'Peaches',
        artistName: 'Justin Bieber',
        albumName: 'Justice',
        albumArtUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
        audioPreviewUrl: null,
        durationMs: 198082,
        releaseDate: '2021-03-19',
        genre: 'R&B',
    },
];

/**
 * Mock: Get Featured Playlists
 */
export async function getMockFeaturedPlaylists(): Promise<SpotifyPlaylist[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockFeaturedPlaylists;
}

/**
 * Mock: Get Popular Artists
 */
export async function getMockPopularArtists(): Promise<SpotifyArtist[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPopularArtists;
}

/**
 * Mock: Get Recently Played
 */
export async function getMockRecentlyPlayed(): Promise<Song[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRecentlyPlayed;
}
