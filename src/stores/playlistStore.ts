/**
 * Playlist Store - Zustand
 * จัดการสถานะ Playlist: CRUD operations พร้อม Mock Data
 */

import { create } from 'zustand';
import type { Playlist, Song, PlaylistSong } from '../types';

// Initial mock playlists
const mockPlaylists: Playlist[] = [
    {
        id: 'playlist_liked',
        name: 'Liked Songs',
        description: 'Songs you\'ve liked',
        coverImageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'mock_user',
        songCount: 0,
    },
];

interface PlaylistState {
    // Data
    playlists: Playlist[];
    currentPlaylist: Playlist | null;
    playlistSongs: Map<string, PlaylistSong[]>; // playlistId -> songs

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchPlaylists: () => Promise<void>;
    createPlaylist: (name: string, description?: string) => Promise<Playlist>;
    updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<void>;
    deletePlaylist: (id: string) => Promise<void>;
    selectPlaylist: (id: string) => void;

    // Song management
    addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
    removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
    getPlaylistSongs: (playlistId: string) => Promise<PlaylistSong[]>;

    // Utility
    clearError: () => void;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
    // Initial state
    playlists: mockPlaylists,
    currentPlaylist: null,
    playlistSongs: new Map(),
    isLoading: false,
    error: null,

    // Fetch all playlists
    fetchPlaylists: async () => {
        set({ isLoading: true, error: null });
        try {
            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 300));
            // In real app: const { data } = await supabase.from('playlists').select()
            set({ playlists: get().playlists, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    // Create new playlist
    createPlaylist: async (name: string, description = '') => {
        set({ isLoading: true, error: null });
        try {
            const newPlaylist: Playlist = {
                id: `playlist_${Date.now()}`,
                name,
                description,
                coverImageUrl: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                userId: 'mock_user',
                songCount: 0,
            };

            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 200));

            set(state => ({
                playlists: [...state.playlists, newPlaylist],
                isLoading: false,
            }));

            return newPlaylist;
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    // Update playlist
    updatePlaylist: async (id: string, updates: Partial<Playlist>) => {
        set({ isLoading: true, error: null });
        try {
            await new Promise(resolve => setTimeout(resolve, 200));

            set(state => ({
                playlists: state.playlists.map(p =>
                    p.id === id
                        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
                        : p
                ),
                currentPlaylist: state.currentPlaylist?.id === id
                    ? { ...state.currentPlaylist, ...updates, updatedAt: new Date().toISOString() }
                    : state.currentPlaylist,
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    // Delete playlist
    deletePlaylist: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await new Promise(resolve => setTimeout(resolve, 200));

            set(state => ({
                playlists: state.playlists.filter(p => p.id !== id),
                currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist,
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    // Select playlist
    selectPlaylist: (id: string) => {
        const playlist = get().playlists.find(p => p.id === id) || null;
        set({ currentPlaylist: playlist });
    },

    // Add song to playlist
    addSongToPlaylist: async (playlistId: string, song: Song) => {
        try {
            const currentSongs = get().playlistSongs.get(playlistId) || [];

            // Check if song already exists
            if (currentSongs.some(ps => ps.songId === song.id)) {
                return;
            }

            const newPlaylistSong: PlaylistSong = {
                id: `ps_${Date.now()}`,
                playlistId,
                songId: song.id,
                addedAt: new Date().toISOString(),
                position: currentSongs.length,
                song,
            };

            const updatedSongs = [...currentSongs, newPlaylistSong];
            const newMap = new Map(get().playlistSongs);
            newMap.set(playlistId, updatedSongs);

            set(state => ({
                playlistSongs: newMap,
                playlists: state.playlists.map(p =>
                    p.id === playlistId
                        ? { ...p, songCount: updatedSongs.length }
                        : p
                ),
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    // Remove song from playlist
    removeSongFromPlaylist: async (playlistId: string, songId: string) => {
        try {
            const currentSongs = get().playlistSongs.get(playlistId) || [];
            const updatedSongs = currentSongs.filter(ps => ps.songId !== songId);

            const newMap = new Map(get().playlistSongs);
            newMap.set(playlistId, updatedSongs);

            set(state => ({
                playlistSongs: newMap,
                playlists: state.playlists.map(p =>
                    p.id === playlistId
                        ? { ...p, songCount: updatedSongs.length }
                        : p
                ),
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    // Get songs in playlist
    getPlaylistSongs: async (playlistId: string) => {
        const songs = get().playlistSongs.get(playlistId) || [];
        return songs;
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
