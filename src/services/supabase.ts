// Re-export supabase client from lib
import { supabase, isConfigured } from '../lib/supabase';

export { supabase, isConfigured };

// Database table types (snake_case for Supabase)
export interface DbSong {
    id: string;
    song_title: string;
    artist_name: string;
    album_name: string;
    album_art_url: string;
    audio_preview_url: string | null;
    duration_ms: number;
    release_date: string;
    genre: string;
    itunes_track_id: string;
    created_at: string;
}

export interface DbPlaylist {
    id: string;
    name: string;
    description: string;
    cover_image_url: string | null;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface DbPlaylistSong {
    id: string;
    playlist_id: string;
    song_id: string;
    added_at: string;
    position: number;
}

export interface DbProfile {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

// =============================================
// Profile Management Functions
// =============================================

/**
 * ดึงข้อมูล Profile ของผู้ใช้
 */
export async function getProfile(userId: string): Promise<DbProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}

/**
 * อัพเดท Profile ของผู้ใช้
 */
export async function updateProfile(
    userId: string,
    updates: Partial<Pick<DbProfile, 'username' | 'display_name' | 'avatar_url'>>
): Promise<DbProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        return null;
    }

    return data;
}

/**
 * สร้าง Profile ใหม่ (ใช้หลัง signup)
 */
export async function createProfile(
    userId: string,
    data: Pick<DbProfile, 'display_name'> & { username?: string }
): Promise<DbProfile | null> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            display_name: data.display_name,
            username: data.username || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating profile:', error);
        return null;
    }

    return profile;
}

// =============================================
// Song Management Functions
// =============================================

/**
 * บันทึกเพลงลง Database
 */
export async function saveSong(song: Omit<DbSong, 'id' | 'created_at'>): Promise<DbSong | null> {
    // Check if song already exists
    const { data: existing } = await supabase
        .from('songs')
        .select('*')
        .eq('itunes_track_id', song.itunes_track_id)
        .single();

    if (existing) {
        return existing;
    }

    // Insert new song
    const { data, error } = await supabase
        .from('songs')
        .insert(song)
        .select()
        .single();

    if (error) {
        console.error('Error saving song:', error);
        return null;
    }

    return data;
}

// =============================================
// Playlist Management Functions
// =============================================

/**
 * ดึง Playlists ของผู้ใช้
 */
export async function getUserPlaylists(userId: string): Promise<DbPlaylist[]> {
    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching playlists:', error);
        return [];
    }

    return data || [];
}

/**
 * สร้าง Playlist ใหม่
 */
export async function createPlaylist(
    userId: string,
    name: string,
    description?: string
): Promise<DbPlaylist | null> {
    const { data, error } = await supabase
        .from('playlists')
        .insert({
            user_id: userId,
            name,
            description: description || '',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating playlist:', error);
        return null;
    }

    return data;
}

/**
 * เพิ่มเพลงเข้า Playlist
 */
export async function addSongToPlaylist(
    playlistId: string,
    songId: string,
    position?: number
): Promise<DbPlaylistSong | null> {
    // Get current max position
    const { data: existing } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

    const newPosition = position ?? ((existing?.[0]?.position ?? -1) + 1);

    const { data, error } = await supabase
        .from('playlist_songs')
        .insert({
            playlist_id: playlistId,
            song_id: songId,
            position: newPosition,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding song to playlist:', error);
        return null;
    }

    return data;
}

/**
 * ลบเพลงออกจาก Playlist
 */
export async function removeSongFromPlaylist(
    playlistId: string,
    songId: string
): Promise<boolean> {
    const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);

    if (error) {
        console.error('Error removing song from playlist:', error);
        return false;
    }

    return true;
}
