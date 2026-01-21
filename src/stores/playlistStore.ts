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
import { 
    getUserPlaylists, 
    createPlaylist as createPlaylistAPI,
    updatePlaylist as updatePlaylistAPI,
    deletePlaylist as deletePlaylistAPI,
    addSongToPlaylist as addSongToPlaylistAPI,
    removeSongFromPlaylist as removeSongFromPlaylistAPI,
    getPlaylistSongsWithDetails,
    saveSong,
    type DbPlaylist,
    type DbSong 
} from '../services/supabase';
import { useAuthStore } from './authStore';

// Helper function: Convert DbPlaylist to Playlist
function dbPlaylistToPlaylist(db: DbPlaylist, songCount: number = 0): Playlist {
    return {
        id: db.id,
        name: db.name,
        description: db.description || '',
        coverImageUrl: db.cover_image_url,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
        userId: db.user_id,
        songCount,
    };
}

// Helper function: Convert DbSong to Song
function dbSongToSong(db: DbSong): Song {
    return {
        id: db.itunes_track_id, // Use iTunes track ID as Song.id
        songTitle: db.song_title,
        artistName: db.artist_name,
        albumName: db.album_name || '',
        albumArtUrl: db.album_art_url || '',
        audioPreviewUrl: db.audio_preview_url,
        durationMs: db.duration_ms,
        releaseDate: db.release_date,
        genre: db.genre || '',
    };
}

// Initial mock playlists (Liked Songs - special playlist)
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
            // Get userId from authStore
            const { user } = useAuthStore.getState();
            if (!user) {
                // ถ้ายังไม่ login ให้ใช้ mock playlists เท่านั้น
                set({ playlists: mockPlaylists, isLoading: false });
                return;
            }

            // Fetch playlists from database
            const dbPlaylists = await getUserPlaylists(user.id);
            
            // Convert to Playlist format with song count
            const playlists: Playlist[] = [
                ...mockPlaylists, // Keep Liked Songs
                ...dbPlaylists.map(db => {
                    // Extract count from playlist_songs aggregate
                    const songCount = (db as any).playlist_songs?.[0]?.count || 0;
                    return dbPlaylistToPlaylist(db, songCount);
                }),
            ];

            set({ playlists, isLoading: false });
        } catch (error) {
            console.error('Error fetching playlists:', error);
            set({ error: 'ไม่สามารถโหลดเพลย์ลิสต์ได้', isLoading: false });
        }
    },

    // Create new playlist - Optimistic Update
    createPlaylist: async (name: string, description = '') => {
        // Get userId from authStore
        const { user } = useAuthStore.getState();
        if (!user) {
            throw new Error('ต้องเข้าสู่ระบบก่อนสร้างเพลย์ลิสต์');
        }

        const tempId = `playlist_temp_${Date.now()}`;
        const tempPlaylist: Playlist = {
            id: tempId,
            name,
            description,
            coverImageUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: user.id,
            songCount: 0,
        };

        // 1. Optimistic: อัพเดท UI ทันที
        set(state => ({
            playlists: [...state.playlists, tempPlaylist],
            error: null,
        }));

        // 2. Sync with server in background
        set({ isSyncing: true });
        try {
            // Call API to create playlist
            const dbPlaylist = await createPlaylistAPI(user.id, name, description);
            
            if (!dbPlaylist) {
                throw new Error('ไม่สามารถสร้างเพลย์ลิสต์ได้');
            }

            // Convert to Playlist format
            const newPlaylist = dbPlaylistToPlaylist(dbPlaylist, 0);

            // 3. Update with real ID from server
            set(state => ({
                playlists: state.playlists.map(p => 
                    p.id === tempId ? newPlaylist : p
                ),
                isSyncing: false,
            }));

            return newPlaylist;
        } catch (error) {
            // 4. Rollback: ถ้า API ล้มเหลว ลบ playlist ที่เพิ่มไว้ออก
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
        // Skip update for mock playlists (like Liked Songs)
        if (id === 'playlist_liked' || id.startsWith('playlist_temp_')) {
            return;
        }

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
            // Convert camelCase to snake_case for database
            const dbUpdates: Partial<Pick<DbPlaylist, 'name' | 'description' | 'cover_image_url' | 'is_public'>> = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.coverImageUrl !== undefined) dbUpdates.cover_image_url = updates.coverImageUrl;
            // Note: is_public is not in Playlist type yet, but can be added if needed

            const dbPlaylist = await updatePlaylistAPI(id, dbUpdates);
            
            if (!dbPlaylist) {
                throw new Error('ไม่สามารถอัพเดทเพลย์ลิสต์ได้');
            }

            // Update with server data
            const updatedPlaylist = dbPlaylistToPlaylist(dbPlaylist, 
                get().playlists.find(p => p.id === id)?.songCount || 0
            );

            set(state => ({
                playlists: state.playlists.map(p =>
                    p.id === id ? updatedPlaylist : p
                ),
                currentPlaylist: state.currentPlaylist?.id === id
                    ? updatedPlaylist
                    : state.currentPlaylist,
                isSyncing: false,
            }));
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
        // Skip delete for mock playlists (like Liked Songs)
        if (id === 'playlist_liked' || id.startsWith('playlist_temp_')) {
            return;
        }

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
            // Call API to delete playlist
            const success = await deletePlaylistAPI(id);
            
            if (!success) {
                throw new Error('ไม่สามารถลบเพลย์ลิสต์ได้');
            }

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

        const tempPlaylistSongId = `ps_temp_${Date.now()}`;
        const newPlaylistSong: PlaylistSong = {
            id: tempPlaylistSongId,
            playlistId,
            songId: song.id, // iTunes track ID (temporary)
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
            // 1. บันทึกเพลงลง songs table (ถ้ายังไม่มี)
            const dbSong = await saveSong({
                itunes_track_id: song.id, // iTunes track ID
                song_title: song.songTitle,
                artist_name: song.artistName,
                album_name: song.albumName,
                album_art_url: song.albumArtUrl,
                audio_preview_url: song.audioPreviewUrl,
                duration_ms: song.durationMs,
                release_date: song.releaseDate,
                genre: song.genre,
            });

            if (!dbSong) {
                throw new Error('ไม่สามารถบันทึกเพลงได้');
            }

            // 2. เพิ่มความสัมพันธ์ลง playlist_songs table
            const dbPlaylistSong = await addSongToPlaylistAPI(
                playlistId,
                dbSong.id, // Use database UUID, not iTunes track ID
                currentSongs.length
            );

            if (!dbPlaylistSong) {
                throw new Error('ไม่สามารถเพิ่มเพลงเข้าเพลย์ลิสต์ได้');
            }

            // 3. Update with real ID from server
            const finalPlaylistSong: PlaylistSong = {
                id: dbPlaylistSong.id,
                playlistId: dbPlaylistSong.playlist_id,
                songId: dbSong.id, // Update to database UUID
                addedAt: dbPlaylistSong.added_at,
                position: dbPlaylistSong.position,
                song,
            };

            const finalMap = new Map(get().playlistSongs);
            const finalSongs = (finalMap.get(playlistId) || []).map(ps =>
                ps.id === tempPlaylistSongId ? finalPlaylistSong : ps
            );
            finalMap.set(playlistId, finalSongs);

            set(state => ({
                playlistSongs: finalMap,
                playlists: state.playlists.map(p =>
                    p.id === playlistId
                        ? { ...p, songCount: finalSongs.length }
                        : p
                ),
                isSyncing: false,
            }));
        } catch (error) {
            // 4. Rollback: ถ้า API ล้มเหลว คืนค่า state เดิม
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
            // Call API to remove song from playlist
            // songId should be database UUID (not iTunes track ID)
            const success = await removeSongFromPlaylistAPI(playlistId, songId);
            
            if (!success) {
                throw new Error('ไม่สามารถลบเพลงออกจากเพลย์ลิสต์ได้');
            }

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
        // Check cache first
        const cachedSongs = get().playlistSongs.get(playlistId);
        if (cachedSongs && cachedSongs.length > 0) {
            return cachedSongs;
        }

        // Skip for mock playlists
        if (playlistId === 'playlist_liked' || playlistId.startsWith('playlist_temp_')) {
            return [];
        }

        try {
            // Fetch from database
            const dbPlaylistSongs = await getPlaylistSongsWithDetails(playlistId);
            
            // Convert to PlaylistSong format
            const playlistSongs: PlaylistSong[] = dbPlaylistSongs.map((item) => ({
                id: item.id,
                playlistId: item.playlist_id,
                songId: item.song.id, // Database UUID
                addedAt: item.added_at,
                position: item.position,
                song: dbSongToSong(item.song),
            }));

            // Cache the results
            const newMap = new Map(get().playlistSongs);
            newMap.set(playlistId, playlistSongs);
            set({ playlistSongs: newMap });

            return playlistSongs;
        } catch (error) {
            console.error('Error fetching playlist songs:', error);
            return [];
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
