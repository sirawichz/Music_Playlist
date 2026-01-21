/**
 * Playlist Store - Zustand
 * จัดการสถานะ Playlist: CRUD operations พร้อม Optimistic Updates
 * 
 * Optimistic Updates Pattern:
 * 1. อัพเดท UI ทันทีก่อนเรียก API
 * 2. เรียก API ใน background
 * 3. ถ้า API ล้มเหลว → rollback กลับไปสถานะเดิม
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

    // Loading states (for initial fetch only)
    isLoading: boolean;
    isSyncing: boolean; // true when syncing with server in background
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
    isSyncing: false,
    error: null,

    // Fetch all playlists
    fetchPlaylists: async () => {
        set({ isLoading: true, error: null });
        try {
            // Mock delay - ในอนาคตจะเรียก API จริง
            await new Promise(resolve => setTimeout(resolve, 300));
            // In real app: const { data } = await supabase.from('playlists').select()
            set({ playlists: get().playlists, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    // Create new playlist - Optimistic Update
    createPlaylist: async (name: string, description = '') => {
        const tempId = `playlist_${Date.now()}`;
        const newPlaylist: Playlist = {
            id: tempId,
            name,
            description,
            coverImageUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'mock_user',
            songCount: 0,
        };

        // 1. Optimistic: อัพเดท UI ทันที
        set(state => ({
            playlists: [...state.playlists, newPlaylist],
            error: null,
        }));

        // 2. Sync with server in background
        set({ isSyncing: true });
        try {
            // Mock API call - ในอนาคตจะเรียก API จริง
            await new Promise(resolve => setTimeout(resolve, 200));
            // In real app: const { data, error } = await supabase.from('playlists').insert({...}).select().single()
            
            // ถ้า API สำเร็จ อาจต้องอัพเดท id จาก server
            // set(state => ({
            //     playlists: state.playlists.map(p => p.id === tempId ? { ...p, id: data.id } : p),
            // }));

            set({ isSyncing: false });
            return newPlaylist;
        } catch (error) {
            // 3. Rollback: ถ้า API ล้มเหลว ลบ playlist ที่เพิ่มไว้ออก
            set(state => ({
                playlists: state.playlists.filter(p => p.id !== tempId),
                error: 'ไม่สามารถสร้างเพลย์ลิสต์ได้ กรุณาลองใหม่',
                isSyncing: false,
            }));
            throw error;
        }
    },

    // Update playlist - Optimistic Update
    updatePlaylist: async (id: string, updates: Partial<Playlist>) => {
        // เก็บ state เดิมสำหรับ rollback
        const previousPlaylists = get().playlists;
        const previousCurrentPlaylist = get().currentPlaylist;

        // 1. Optimistic: อัพเดท UI ทันที
        set(state => ({
            playlists: state.playlists.map(p =>
                p.id === id
                    ? { ...p, ...updates, updatedAt: new Date().toISOString() }
                    : p
            ),
            currentPlaylist: state.currentPlaylist?.id === id
                ? { ...state.currentPlaylist, ...updates, updatedAt: new Date().toISOString() }
                : state.currentPlaylist,
            error: null,
        }));

        // 2. Sync with server in background
        set({ isSyncing: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            // In real app: await supabase.from('playlists').update(updates).eq('id', id)
            set({ isSyncing: false });
        } catch (error) {
            // 3. Rollback: ถ้า API ล้มเหลว คืนค่า state เดิม
            set({
                playlists: previousPlaylists,
                currentPlaylist: previousCurrentPlaylist,
                error: 'ไม่สามารถอัพเดทเพลย์ลิสต์ได้ กรุณาลองใหม่',
                isSyncing: false,
            });
        }
    },

    // Delete playlist - Optimistic Update
    deletePlaylist: async (id: string) => {
        // เก็บ state เดิมสำหรับ rollback
        const previousPlaylists = get().playlists;
        const previousCurrentPlaylist = get().currentPlaylist;
        const deletedPlaylist = previousPlaylists.find(p => p.id === id);

        // 1. Optimistic: ลบจาก UI ทันที
        set(state => ({
            playlists: state.playlists.filter(p => p.id !== id),
            currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist,
            error: null,
        }));

        // 2. Sync with server in background
        set({ isSyncing: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            // In real app: await supabase.from('playlists').delete().eq('id', id)
            set({ isSyncing: false });
        } catch (error) {
            // 3. Rollback: ถ้า API ล้มเหลว คืน playlist กลับมา
            set({
                playlists: previousPlaylists,
                currentPlaylist: previousCurrentPlaylist,
                error: `ไม่สามารถลบ "${deletedPlaylist?.name}" ได้ กรุณาลองใหม่`,
                isSyncing: false,
            });
        }
    },

    // Select playlist
    selectPlaylist: (id: string) => {
        const playlist = get().playlists.find(p => p.id === id) || null;
        set({ currentPlaylist: playlist });
    },

    // Add song to playlist - Optimistic Update
    addSongToPlaylist: async (playlistId: string, song: Song) => {
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

        // เก็บ state เดิมสำหรับ rollback
        const previousPlaylistSongs = new Map(get().playlistSongs);
        const previousPlaylists = get().playlists;

        // 1. Optimistic: เพิ่มเพลงใน UI ทันที
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
            error: null,
        }));

        // 2. Sync with server in background
        set({ isSyncing: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 150));
            // In real app:
            // 1. บันทึกเพลงลง songs table (ถ้ายังไม่มี)
            // 2. เพิ่มความสัมพันธ์ลง playlist_songs table
            set({ isSyncing: false });
        } catch (error) {
            // 3. Rollback: ถ้า API ล้มเหลว คืนค่า state เดิม
            set({
                playlistSongs: previousPlaylistSongs,
                playlists: previousPlaylists,
                error: `ไม่สามารถเพิ่ม "${song.songTitle}" ได้ กรุณาลองใหม่`,
                isSyncing: false,
            });
        }
    },

    // Remove song from playlist - Optimistic Update
    removeSongFromPlaylist: async (playlistId: string, songId: string) => {
        // เก็บ state เดิมสำหรับ rollback
        const previousPlaylistSongs = new Map(get().playlistSongs);
        const previousPlaylists = get().playlists;
        const currentSongs = get().playlistSongs.get(playlistId) || [];
        const removedSong = currentSongs.find(ps => ps.songId === songId);

        // 1. Optimistic: ลบเพลงจาก UI ทันที
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
            error: null,
        }));

        // 2. Sync with server in background
        set({ isSyncing: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 150));
            // In real app: await supabase.from('playlist_songs').delete().eq('playlist_id', playlistId).eq('song_id', songId)
            set({ isSyncing: false });
        } catch (error) {
            // 3. Rollback: ถ้า API ล้มเหลว คืนเพลงกลับมา
            set({
                playlistSongs: previousPlaylistSongs,
                playlists: previousPlaylists,
                error: `ไม่สามารถลบ "${removedSong?.song?.songTitle}" ได้ กรุณาลองใหม่`,
                isSyncing: false,
            });
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
