import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

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
    email: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string;
}
