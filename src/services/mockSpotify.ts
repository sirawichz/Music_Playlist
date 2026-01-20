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
 * Mock: Popular Artists
 */
export const mockPopularArtists: SpotifyArtist[] = [
    {
        id: 'artist_1',
        name: 'Taylor Swift',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        followers: 89000000,
        genres: ['pop', 'country'],
    },
    {
        id: 'artist_2',
        name: 'The Weeknd',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        followers: 75000000,
        genres: ['r&b', 'pop'],
    },
    {
        id: 'artist_3',
        name: 'Drake',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
        followers: 82000000,
        genres: ['hip hop', 'rap'],
    },
    {
        id: 'artist_4',
        name: 'Dua Lipa',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
        followers: 45000000,
        genres: ['pop', 'dance'],
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
